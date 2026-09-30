const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

// GET /api/rates — get all exchange rates
router.get('/', (req, res) => {
  const rates = db.prepare('SELECT * FROM exchange_rates ORDER BY currency ASC').all();
  res.json(rates);
});

// GET /api/rates/:currency
router.get('/:currency', (req, res) => {
  const rate = db.prepare('SELECT * FROM exchange_rates WHERE currency = ?').get(req.params.currency.toUpperCase());
  if (!rate) return res.status(404).json({ error: 'Currency rate not found' });
  res.json(rate);
});

// POST /api/rates/update — update exchange rate (Admin / Demelash only)
router.post('/update', auth(), (req, res) => {
  // Strict authorization: Only Demelash / Admin can modify live exchange rates
  const isAuthorized = req.user && (
    req.user.role === 'admin' ||
    req.user.phone === '+33773552239' ||
    req.user.email === 'demelash.deguale@etu.emse.fr' ||
    req.user.email === 'dadtegy@gmail.com'
  );
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Access denied: Only the official BirrLink operator (Demelash) can update exchange rates.' });
  }

  const { currency, rate_to_etb } = req.body;
  if (!currency || !rate_to_etb || isNaN(rate_to_etb) || rate_to_etb <= 0) {
    return res.status(400).json({ error: 'Valid currency and positive rate_to_etb are required' });
  }

  const curr = currency.toUpperCase();
  const numRate = parseFloat(rate_to_etb);

  const exists = db.prepare('SELECT * FROM exchange_rates WHERE currency = ?').get(curr);
  if (!exists) {
    const symbol = curr === 'EUR' ? '€' : curr === 'USD' ? '$' : curr === 'GBP' ? '£' : curr;
    db.prepare(`
      INSERT INTO exchange_rates (currency, symbol, rate_to_etb, updated_at, updated_by)
      VALUES (?, ?, ?, datetime('now'), ?)
    `).run(curr, symbol, numRate, req.user.name);
  } else {
    db.prepare(`
      UPDATE exchange_rates
      SET rate_to_etb = ?, updated_at = datetime('now'), updated_by = ?
      WHERE currency = ?
    `).run(numRate, req.user.name, curr);
  }

  const updated = db.prepare('SELECT * FROM exchange_rates WHERE currency = ?').get(curr);
  res.json({ message: 'Exchange rate updated successfully', rate: updated });
});

module.exports = router;
