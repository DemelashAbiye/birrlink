require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const notifRoutes = require('./routes/notifications');
const ratesRoutes = require('./routes/rates');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/rates', ratesRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'BirrLink' }));

// ── Serve Frontend Production Build ───────────────────────────────────────────────
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// SPA catch-all
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 BirrLink running on port ${PORT}`));
