const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

// GET /api/notifications — own notifications
router.get('/', auth(), (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(req.user.id);
  res.json(rows);
});

// GET /api/notifications/unread-count
router.get('/unread-count', auth(), (req, res) => {
  const { c } = db.prepare(
    'SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND read = 0'
  ).get(req.user.id);
  res.json({ count: c });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', auth(), (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  res.json({ message: 'Marked as read' });
});

// PATCH /api/notifications/read-all
router.patch('/read-all', auth(), (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'All marked as read' });
});

module.exports = router;
