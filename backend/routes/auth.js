const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role, business, location } = req.body;
  // Normalize: keep + and digits only, strip spaces/dashes
  const phone = (req.body.phone || '').replace(/[\s\-]/g, '');
  if (!name || !phone || !password || !role) {
    return res.status(400).json({ error: 'name, phone, password, and role are required' });
  }
  if (!['supplier', 'retailer'].includes(role)) {
    return res.status(400).json({ error: 'Role must be supplier or retailer' });
  }
  if (phone.length < 7) {
    return res.status(400).json({ error: 'Please enter a valid phone number with country code' });
  }

  const exists = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (exists) return res.status(409).json({ error: 'Phone number already registered' });

  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, name, phone, email, password, role, business, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, phone, email || null, hash, role, business || null, location || null);

  // Init trust score
  db.prepare('INSERT OR IGNORE INTO trust_scores (user_id) VALUES (?)').run(id);

  // Welcome notification
  db.prepare(`
    INSERT INTO notifications (id, user_id, message, message_am, type)
    VALUES (?, ?, ?, ?, 'success')
  `).run(uuidv4(), id,
    `Welcome to TradeLink, ${name}! Your account is ready.`,
    `ወደ TradeLink እንኳን ደህና መጡ, ${name}! መለያዎ ዝግጁ ነው።`
  );

  const token = jwt.sign({ id, role, name, phone }, SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, phone, email, role, business, location } });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const input = (req.body.phone || req.body.email || req.body.identifier || '').trim();
  const { password } = req.body;
  if (!input || !password) return res.status(400).json({ error: 'Phone or email and password required' });

  // Generate phone variations
  const cleanPhone = input.replace(/[\s\-]/g, '');
  let altPhone = cleanPhone;
  if (cleanPhone.startsWith('+251')) {
    altPhone = '0' + cleanPhone.slice(4); // +2519... -> 09...
  } else if (cleanPhone.startsWith('09')) {
    altPhone = '+251' + cleanPhone.slice(1); // 09... -> +2519...
  } else if (cleanPhone.startsWith('+330')) {
    altPhone = '+33' + cleanPhone.slice(4); // remove French leading zero
  }

  // Allow lookup by phone variation or email
  const user = db.prepare(`
    SELECT * FROM users 
    WHERE phone = ? 
       OR phone = ? 
       OR LOWER(COALESCE(email, '')) = LOWER(?)
  `).get(cleanPhone, altPhone, input);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid phone, email, or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, phone: user.phone },
    SECRET, { expiresIn: '7d' }
  );
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').auth(), (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;
