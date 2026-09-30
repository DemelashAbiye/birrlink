const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');
const { getScore, creditLimit } = require('../services/trustEngine');

// GET /api/admin/dashboard — platform KPIs
router.get('/dashboard', auth(['admin']), (req, res) => {
  const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role != 'admin'").get().c;
  const suppliers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'supplier'").get().c;
  const retailers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'retailer'").get().c;
  const totalInvoices = db.prepare("SELECT COUNT(*) as c FROM invoices").get().c;
  const totalVolume = db.prepare("SELECT COALESCE(SUM(amount),0) as s FROM invoices").get().s;
  const financed = db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(advance_amount),0) as s FROM invoices WHERE status IN ('financed','repaid')").get();
  const repaid = db.prepare("SELECT COUNT(*) as c FROM invoices WHERE status = 'repaid'").get().c;
  const pending = db.prepare("SELECT COUNT(*) as c FROM invoices WHERE status = 'financing_requested'").get().c;
  const overdue = db.prepare(`
    SELECT COUNT(*) as c FROM invoices
    WHERE status = 'financed' AND due_date < date('now')
  `).get().c;

  res.json({
    users: { total: totalUsers, suppliers, retailers },
    invoices: { total: totalInvoices, pending_finance: pending, financed: financed.c, repaid, overdue },
    volume: { total: totalVolume, advanced: financed.s }
  });
});

// GET /api/admin/users — all users with scores
router.get('/users', auth(['admin']), (req, res) => {
  const users = db.prepare(`
    SELECT id, name, phone, email, role, business, location, verified, created_at
    FROM users WHERE role != 'admin' ORDER BY created_at DESC
  `).all();
  const result = users.map(u => {
    if (u.role === 'retailer') {
      const s = getScore(u.id);
      return { ...u, trust_score: s.computed, credit_limit: creditLimit(s.computed) };
    }
    return u;
  });
  res.json(result);
});

// PATCH /api/admin/users/:id/verify
router.patch('/users/:id/verify', auth(['admin']), (req, res) => {
  db.prepare("UPDATE users SET verified = 1 WHERE id = ?").run(req.params.id);
  res.json({ message: 'User verified' });
});

// GET /api/admin/finance-requests — all pending finance requests
router.get('/finance-requests', auth(['admin']), (req, res) => {
  const rows = db.prepare(`
    SELECT i.*,
      s.name as supplier_name, s.phone as supplier_phone, s.business as supplier_business,
      r.name as retailer_name, r.phone as retailer_phone, r.business as retailer_business
    FROM invoices i
    JOIN users s ON i.supplier_id = s.id
    JOIN users r ON i.retailer_id = r.id
    WHERE i.status = 'financing_requested'
    ORDER BY i.created_at DESC
  `).all();
  const result = rows.map(r => {
    const score = getScore(r.retailer_id);
    return { ...r, retailer_trust_score: score.computed };
  });
  res.json(result);
});

// GET /api/admin/overdue — overdue financed invoices
router.get('/overdue', auth(['admin']), (req, res) => {
  const rows = db.prepare(`
    SELECT i.*,
      s.name as supplier_name, r.name as retailer_name, r.phone as retailer_phone
    FROM invoices i
    JOIN users s ON i.supplier_id = s.id
    JOIN users r ON i.retailer_id = r.id
    WHERE i.status = 'financed' AND i.due_date < date('now')
    ORDER BY i.due_date ASC
  `).all();
  res.json(rows);
});

module.exports = router;
