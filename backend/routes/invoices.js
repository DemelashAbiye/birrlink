const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { getScore, isEligible, creditLimit, updateScore } = require('../services/trustEngine');

// ── Helper: push notification ─────────────────────────────────────────────────
function notify(userId, msg, msgAm, type = 'info') {
  db.prepare(`
    INSERT INTO notifications (id, user_id, message, message_am, type)
    VALUES (?, ?, ?, ?, ?)
  `).run(uuidv4(), userId, msg, msgAm, type);
}

// ── GET /api/invoices  (role-scoped) ─────────────────────────────────────────
router.get('/', auth(), (req, res) => {
  const { role, id } = req.user;
  let rows;
  if (role === 'supplier') {
    rows = db.prepare(`
      SELECT i.*, u.name as retailer_name, u.phone as retailer_phone, u.business as retailer_business
      FROM invoices i JOIN users u ON i.retailer_id = u.id
      WHERE i.supplier_id = ? ORDER BY i.created_at DESC
    `).all(id);
  } else if (role === 'retailer') {
    rows = db.prepare(`
      SELECT i.*, u.name as supplier_name, u.phone as supplier_phone, u.business as supplier_business
      FROM invoices i JOIN users u ON i.supplier_id = u.id
      WHERE i.retailer_id = ? ORDER BY i.created_at DESC
    `).all(id);
  } else {
    // admin sees all
    rows = db.prepare(`
      SELECT i.*,
        s.name as supplier_name, s.business as supplier_business,
        r.name as retailer_name, r.business as retailer_business
      FROM invoices i
      JOIN users s ON i.supplier_id = s.id
      JOIN users r ON i.retailer_id = r.id
      ORDER BY i.created_at DESC
    `).all();
  }
  res.json(rows);
});

// ── POST /api/invoices  (supplier creates invoice) ───────────────────────────
router.post('/', auth(['supplier']), (req, res) => {
  const { retailer_phone, amount, description, due_date, currency = 'ETB' } = req.body;
  if (!retailer_phone || !amount || !due_date) {
    return res.status(400).json({ error: 'retailer_phone, amount, and due_date are required' });
  }
  const retailer = db.prepare('SELECT * FROM users WHERE phone = ? AND role = ?')
    .get(retailer_phone, 'retailer');
  if (!retailer) return res.status(404).json({ error: 'Retailer not found with that phone number' });

  // Get current exchange rate for currency
  let fx_rate = 1.0;
  if (currency !== 'ETB') {
    const rateRow = db.prepare('SELECT rate_to_etb FROM exchange_rates WHERE currency = ?').get(currency.toUpperCase());
    if (rateRow) fx_rate = rateRow.rate_to_etb;
    else if (req.body.fx_rate) fx_rate = parseFloat(req.body.fx_rate);
  }

  const numAmount = parseFloat(amount);
  const amount_etb = currency === 'ETB' ? numAmount : parseFloat((numAmount * fx_rate).toFixed(2));

  const id = uuidv4();
  db.prepare(`
    INSERT INTO invoices (id, supplier_id, retailer_id, amount, currency, fx_rate, amount_etb, description, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, retailer.id, numAmount, currency.toUpperCase(), fx_rate, amount_etb, description || null, due_date);

  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);

  // Notify retailer
  const currencyDisplay = currency === 'EUR' ? `€${numAmount.toLocaleString()} (~ETB ${amount_etb.toLocaleString()})` : `ETB ${numAmount.toLocaleString()}`;
  notify(retailer.id,
    `New invoice from ${req.user.name}: ${currencyDisplay} — due ${due_date}. Please confirm receipt.`,
    `ከ${req.user.name} አዲስ ደረሰኝ: ${currencyDisplay} — የሚከፈልበት ቀን ${due_date}። እባክዎ ደርሷል ብለው ያረጋግጡ።`,
    'invoice'
  );

  res.status(201).json(invoice);
});

// ── PATCH /api/invoices/:id/confirm  (retailer confirms receipt) ──────────────
router.patch('/:id/confirm', auth(['retailer']), (req, res) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND retailer_id = ?')
    .get(req.params.id, req.user.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (invoice.status !== 'pending') return res.status(400).json({ error: 'Invoice already processed' });

  db.prepare("UPDATE invoices SET status = 'confirmed' WHERE id = ?").run(invoice.id);

  const supplier = db.prepare('SELECT * FROM users WHERE id = ?').get(invoice.supplier_id);
  notify(supplier.id,
    `${req.user.name} confirmed receipt of invoice #${invoice.id.slice(0,8)} (ETB ${invoice.amount}).`,
    `${req.user.name} ደረሰኝ #${invoice.id.slice(0,8)} (ETB ${invoice.amount}) ደርሷቸዋል ብለዋል።`,
    'success'
  );

  res.json({ message: 'Invoice confirmed', invoice: { ...invoice, status: 'confirmed' } });
});

// ── POST /api/invoices/:id/request-finance  (supplier requests advance) ───────
router.post('/:id/request-finance', auth(['supplier']), (req, res) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND supplier_id = ?')
    .get(req.params.id, req.user.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (invoice.status !== 'confirmed') {
    return res.status(400).json({ error: 'Invoice must be confirmed by retailer before requesting finance' });
  }

  // Check retailer eligibility
  const { eligible, score } = isEligible(invoice.retailer_id);
  if (!eligible) {
    return res.status(400).json({
      error: 'Retailer does not meet financing eligibility criteria',
      retailer_score: score
    });
  }

  const advance = parseFloat((invoice.amount * 0.80).toFixed(2)); // 80% advance
  db.prepare(`
    UPDATE invoices SET status = 'financing_requested', advance_amount = ? WHERE id = ?
  `).run(advance, invoice.id);

  // Notify admin
  const admin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
  if (admin) notify(admin.id,
    `Finance request: Invoice #${invoice.id.slice(0,8)} for ETB ${invoice.amount} from ${req.user.name}. Retailer score: ${score.toFixed(0)}.`,
    null, 'finance'
  );

  res.json({ message: 'Financing requested', advance_amount: advance, retailer_score: score });
});

// ── POST /api/invoices/:id/approve-finance  (admin approves) ─────────────────
router.post('/:id/approve-finance', auth(['admin']), (req, res) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (invoice.status !== 'financing_requested') {
    return res.status(400).json({ error: 'Invoice is not in financing_requested status' });
  }

  db.prepare(`
    UPDATE invoices SET status = 'financed', financed_at = datetime('now') WHERE id = ?
  `).run(invoice.id);

  const supplier = db.prepare('SELECT * FROM users WHERE id = ?').get(invoice.supplier_id);
  notify(supplier.id,
    `🎉 Your finance request approved! ETB ${invoice.advance_amount} will be transferred to your account within 24 hours.`,
    `🎉 የፋይናንስ ጥያቄዎ ተቀባይነት አገኘ! ETB ${invoice.advance_amount} ውስጥ 24 ሰዓት ይደርስዎታል።`,
    'success'
  );

  const retailer = db.prepare('SELECT * FROM users WHERE id = ?').get(invoice.retailer_id);
  notify(retailer.id,
    `Invoice #${invoice.id.slice(0,8)} has been financed. Payment of ETB ${invoice.amount} is due by ${invoice.due_date}.`,
    `ደረሰኝ #${invoice.id.slice(0,8)} ፋይናንስ ተደርጓል። ETB ${invoice.amount} እስከ ${invoice.due_date} ይከፈላል።`,
    'warning'
  );

  res.json({ message: 'Finance approved', invoice: { ...invoice, status: 'financed' } });
});

// ── POST /api/invoices/:id/repay  (retailer repays) ──────────────────────────
router.post('/:id/repay', auth(['retailer']), (req, res) => {
  const { method = 'telebirr' } = req.body;
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND retailer_id = ?')
    .get(req.params.id, req.user.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (invoice.status !== 'financed') {
    return res.status(400).json({ error: 'Only financed invoices can be repaid' });
  }

  // Mark repaid
  db.prepare(`
    UPDATE invoices SET status = 'repaid', repaid_at = datetime('now') WHERE id = ?
  `).run(invoice.id);

  // Record repayment
  const repayId = uuidv4();
  db.prepare(`
    INSERT INTO repayments (id, invoice_id, retailer_id, amount, method)
    VALUES (?, ?, ?, ?, ?)
  `).run(repayId, invoice.id, req.user.id, invoice.amount, method);

  // Update trust score
  const dueDate = new Date(invoice.due_date);
  const paidDate = new Date();
  const onTime = paidDate <= dueDate;
  const newScore = updateScore(req.user.id, { invoicePaid: true, onTime, amount: invoice.amount });

  // Notify supplier
  const supplier = db.prepare('SELECT * FROM users WHERE id = ?').get(invoice.supplier_id);
  notify(supplier.id,
    `✅ Invoice #${invoice.id.slice(0,8)} repaid by ${req.user.name}. ETB ${invoice.amount} settled.`,
    `✅ ደረሰኝ #${invoice.id.slice(0,8)} በ${req.user.name} ተከፍሏል። ETB ${invoice.amount} ተወራ።`,
    'success'
  );

  res.json({ message: 'Repayment recorded', on_time: onTime, new_trust_score: newScore });
});

// ── GET /api/invoices/:id  (single invoice detail) ───────────────────────────
router.get('/:id', auth(), (req, res) => {
  const invoice = db.prepare(`
    SELECT i.*,
      s.name as supplier_name, s.phone as supplier_phone, s.business as supplier_business,
      r.name as retailer_name, r.phone as retailer_phone, r.business as retailer_business
    FROM invoices i
    JOIN users s ON i.supplier_id = s.id
    JOIN users r ON i.retailer_id = r.id
    WHERE i.id = ?
  `).get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});

// ── GET /api/invoices/verify/:id (Public, no auth needed for WhatsApp trust check) ──
router.get('/verify/:id', (req, res) => {
  const queryId = req.params.id;
  const invoice = db.prepare(`
    SELECT i.id, i.amount, i.currency, i.fx_rate, i.amount_etb, i.status,
           i.description, i.due_date, i.created_at, i.financed_at, i.repaid_at,
           s.name as supplier_name, s.business as supplier_business,
           r.name as retailer_name, r.business as retailer_business
    FROM invoices i
    JOIN users s ON i.supplier_id = s.id
    JOIN users r ON i.retailer_id = r.id
    WHERE i.id = ? OR i.id LIKE ?
  `).get(queryId, `${queryId}%`);

  if (!invoice) return res.status(404).json({ error: 'No transaction found with this reference ID' });

  res.json({
    ...invoice,
    verified_guarantee: true,
    security_stamp: `TL-CERT-${invoice.id.slice(0, 8).toUpperCase()}`,
    audit_hash: Buffer.from(`${invoice.id}-${invoice.amount}-${invoice.created_at}`).toString('base64').slice(0, 16),
  });
});

module.exports = router;
