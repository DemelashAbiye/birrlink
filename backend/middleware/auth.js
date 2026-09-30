const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'tradelink_secret_2024';

const auth = (roles = []) => (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { auth, SECRET };
