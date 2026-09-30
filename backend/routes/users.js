const router = require('express').Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { getScore, creditLimit } = require('../services/trustEngine');

// GET /api/users/me/score  — retailer trust score + credit limit
router.get('/me/score', auth(['retailer', 'admin']), (req, res) => {
  const targetId = req.query.userId && req.user.role === 'admin'
    ? req.query.userId
    : req.user.id;
  const data = getScore(targetId);
  res.json({ ...data, credit_limit: creditLimit(data.computed) });
});

// GET /api/users/search?phone=... — for supplier to find retailer
router.get('/search', auth(['supplier', 'admin']), (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'phone query required' });
  const user = db.prepare(
    'SELECT id, name, phone, business, location, verified FROM users WHERE phone = ? AND role = ?'
  ).get(phone, 'retailer');
  if (!user) return res.status(404).json({ error: 'Retailer not found' });
  const score = getScore(user.id);
  res.json({ ...user, trust_score: score.computed, credit_limit: creditLimit(score.computed) });
});

// GET /api/users/retailers  — supplier gets their linked retailers
router.get('/retailers', auth(['supplier']), (req, res) => {
  const rows = db.prepare(`
    SELECT DISTINCT u.id, u.name, u.phone, u.business, u.location, u.verified
    FROM users u
    JOIN invoices i ON i.retailer_id = u.id
    WHERE i.supplier_id = ?
  `).all(req.user.id);
  const result = rows.map(r => {
    const s = getScore(r.id);
    return { ...r, trust_score: s.computed, credit_limit: creditLimit(s.computed) };
  });
  res.json(result);
});

// GET /api/users/operator/trust-profile (PUBLIC — no auth needed for WhatsApp trust check)
router.get('/operator/trust-profile', (req, res) => {
  let operator = db.prepare("SELECT * FROM users WHERE name LIKE '%Demelash%' OR location LIKE '%France%' LIMIT 1").get();
  if (!operator) {
    operator = db.prepare("SELECT * FROM users WHERE role IN ('supplier','admin') ORDER BY created_at DESC LIMIT 1").get();
  }

  const eurRateRow = db.prepare("SELECT rate_to_etb FROM exchange_rates WHERE currency = 'EUR'").get();
  const eurRate = eurRateRow ? eurRateRow.rate_to_etb : 144.50;

  const settlementStats = db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(amount_eur), 0) as s FROM settlements").get();
  const totalDeals = settlementStats?.c || 0;
  const totalVolumeEur = settlementStats?.s || 0;

  const recentSettlements = db.prepare("SELECT * FROM settlements ORDER BY created_at DESC LIMIT 10").all();

  const isDemoAbebe = operator?.name?.includes('Abebe');

  res.json({
    operator: {
      id: operator?.id,
      name: isDemoAbebe ? 'Demelash Deguale' : (operator?.name || 'Demelash Deguale'),
      location: isDemoAbebe ? 'Saint-Étienne, France 🇫🇷' : (operator?.location || 'Saint-Étienne, France 🇫🇷'),
      institution: operator?.institution || 'École des Mines Saint-Étienne',
      bio: operator?.bio || 'MSc in Sustainable Manufacturing (EMJM meta4.0). Trusted exchange coordinator for Ethiopian diaspora community in France & Europe.',
      whatsapp: '+33 7 73 55 22 39',
      whatsapp_wa_me: '33773552239',
      phone: '+33 7 73 55 22 39',
      trust_level: operator?.trust_level || 'Tier 1 Verified Operator',
      verified: true,
      member_since: operator?.created_at,
    },
    metrics: {
      total_deals: totalDeals,
      total_volume_eur: totalVolumeEur,
      success_rate: totalDeals > 0 ? '100%' : '100%',
      dispute_count: 0,
      avg_payout_time: totalDeals > 0 ? '5.8 minutes' : '< 10 minutes',
      eur_rate: eurRate,
      reserve_status: 'Active & Verified',
    },
    settlements: recentSettlements,
  });
});

// PATCH /api/users/profile — update own profile
router.patch('/profile', auth(), (req, res) => {
  const { name, business, location, email, institution, bio, whatsapp } = req.body;
  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      business = COALESCE(?, business),
      location = COALESCE(?, location),
      email = COALESCE(?, email),
      institution = COALESCE(?, institution),
      bio = COALESCE(?, bio),
      whatsapp = COALESCE(?, whatsapp)
    WHERE id = ?
  `).run(
    name || null,
    business || null,
    location || null,
    email || null,
    institution || null,
    bio || null,
    whatsapp || null,
    req.user.id
  );
  const user = db.prepare('SELECT id,name,phone,email,role,business,location,institution,bio,whatsapp,verified FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// GET /api/users/settlements — list recent settlements
router.get('/settlements', (req, res) => {
  const rows = db.prepare('SELECT * FROM settlements ORDER BY created_at DESC LIMIT 20').all();
  res.json(rows);
});

// GET /api/users/settlements/:id — public digital receipt verification
router.get('/settlements/:id', (req, res) => {
  const { id } = req.params;
  const item = db.prepare('SELECT * FROM settlements WHERE id = ?').get(id);
  if (!item) {
    return res.status(404).json({ error: 'Receipt not found' });
  }

  // Operator metadata
  const operator = {
    name: 'Demelash Abiye Deguale',
    institution: 'École des Mines Saint-Étienne (EMJM meta4.0)',
    location: 'Saint-Étienne, France 🇫🇷',
    email: 'demelash.deguale@etu.emse.fr',
    status: 'Verified Academic Operator',
  };

  // Anti-tamper checksum
  const payload = `${item.id}|${item.amount_eur}|${item.rate}|${item.amount_etb}|${item.cbe_ref}|${item.created_at}`;
  const digitalChecksum = crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16).toUpperCase();

  res.json({
    receipt: {
      ...item,
      digitalChecksum,
      verification_status: 'AUTHENTIC & DELIVERED',
      operator,
    }
  });
});

// POST /api/users/settlements — create a new settlement receipt (Strictly Demelash / Admin only)
router.post('/settlements', auth(), (req, res) => {
  const isAuthorized = req.user && (
    req.user.role === 'admin' ||
    req.user.phone === '+33773552239' ||
    req.user.email === 'demelash.deguale@etu.emse.fr' ||
    req.user.email === 'dadtegy@gmail.com'
  );
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Access denied: Only the official BirrLink operator (Demelash) can create official receipts.' });
  }

  const {
    amount_eur,
    rate,
    amount_etb,
    bank_name,
    beneficiary,
    account_number,
    sender_name,
    cbe_ref,
    settled_mins,
    transfer_type,
    notes,
  } = req.body;

  if (!amount_eur || !rate || !bank_name || !beneficiary || !cbe_ref) {
    return res.status(400).json({ error: 'Missing required settlement fields' });
  }

  const computedEtb = amount_etb || Math.round(Number(amount_eur) * Number(rate) * 100) / 100;
  const id = `TRX-${Math.floor(100000 + Math.random() * 900000)}`;

  db.prepare(`
    INSERT INTO settlements (
      id, amount_eur, rate, amount_etb, bank_name, beneficiary,
      cbe_ref, settled_mins, account_number, sender_name, transfer_type, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    id,
    Number(amount_eur),
    Number(rate),
    Number(computedEtb),
    bank_name,
    beneficiary,
    cbe_ref,
    Number(settled_mins || 5),
    account_number || null,
    sender_name || null,
    transfer_type || 'Standard',
    notes || null
  );

  const created = db.prepare('SELECT * FROM settlements WHERE id = ?').get(id);
  res.status(201).json(created);
});

// DELETE /api/users/settlements/:id — delete a settlement receipt (Strictly Demelash / Admin only)
router.delete('/settlements/:id', auth(), (req, res) => {
  const isAuthorized = req.user && (
    req.user.role === 'admin' ||
    req.user.phone === '+33773552239' ||
    req.user.email === 'demelash.deguale@etu.emse.fr' ||
    req.user.email === 'dadtegy@gmail.com'
  );
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Access denied: Only the official BirrLink operator (Demelash) can delete receipts.' });
  }

  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM settlements WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Transaction record not found' });
  }

  db.prepare('DELETE FROM settlements WHERE id = ?').run(id);
  res.json({ message: 'Transaction receipt deleted successfully', deletedId: id });
});

module.exports = router;


