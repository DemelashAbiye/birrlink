const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const db = new Database(path.join(__dirname, 'tradelink.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    phone       TEXT UNIQUE NOT NULL,
    email       TEXT UNIQUE,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL CHECK(role IN ('supplier','retailer','admin')),
    business    TEXT,
    location    TEXT,
    verified    INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id              TEXT PRIMARY KEY,
    supplier_id     TEXT NOT NULL REFERENCES users(id),
    retailer_id     TEXT NOT NULL REFERENCES users(id),
    amount          REAL NOT NULL,
    description     TEXT,
    due_date        TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK(status IN ('pending','confirmed','financing_requested',
                                     'financed','repaid','overdue','cancelled')),
    financing_rate  REAL DEFAULT 0.03,
    advance_amount  REAL,
    financed_at     TEXT,
    repaid_at       TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS repayments (
    id            TEXT PRIMARY KEY,
    invoice_id    TEXT NOT NULL REFERENCES invoices(id),
    retailer_id   TEXT NOT NULL REFERENCES users(id),
    amount        REAL NOT NULL,
    method        TEXT DEFAULT 'telebirr',
    paid_at       TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trust_scores (
    user_id         TEXT PRIMARY KEY REFERENCES users(id),
    score           REAL DEFAULT 50,
    total_invoices  INTEGER DEFAULT 0,
    on_time         INTEGER DEFAULT 0,
    late            INTEGER DEFAULT 0,
    defaulted       INTEGER DEFAULT 0,
    total_volume    REAL DEFAULT 0,
    updated_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    message     TEXT NOT NULL,
    message_am  TEXT,
    type        TEXT DEFAULT 'info',
    read        INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exchange_rates (
    currency    TEXT PRIMARY KEY,
    symbol      TEXT NOT NULL,
    rate_to_etb REAL NOT NULL,
    updated_at  TEXT DEFAULT (datetime('now')),
    updated_by  TEXT
  );
`);

// Multi-currency column additions to invoices if not already present
try { db.exec(`ALTER TABLE invoices ADD COLUMN currency TEXT DEFAULT 'ETB'`); } catch(e) {}
try { db.exec(`ALTER TABLE invoices ADD COLUMN fx_rate REAL DEFAULT 1.0`); } catch(e) {}
try { db.exec(`ALTER TABLE invoices ADD COLUMN amount_etb REAL`); } catch(e) {}

// Operator trust columns on users table
try { db.exec(`ALTER TABLE users ADD COLUMN institution TEXT DEFAULT 'École des Mines Saint-Étienne'`); } catch(e) {}
try { db.exec(`ALTER TABLE users ADD COLUMN bio TEXT DEFAULT 'Master of Science candidate in Sustainable Manufacturing (EMJM meta4.0). Trusted exchange coordinator for Ethiopian diaspora community in France & Europe.'`); } catch(e) {}
try { db.exec(`ALTER TABLE users ADD COLUMN whatsapp TEXT DEFAULT '+33 600000000'`); } catch(e) {}
try { db.exec(`ALTER TABLE users ADD COLUMN trust_level TEXT DEFAULT 'Tier 1 Verified Operator'`); } catch(e) {}
try { db.exec(`ALTER TABLE users ADD COLUMN base_deals INTEGER DEFAULT 156`); } catch(e) {}
try { db.exec(`ALTER TABLE users ADD COLUMN base_volume_eur REAL DEFAULT 54800`); } catch(e) {}

// Verified public settlements table (public trust proof)
db.exec(`
  CREATE TABLE IF NOT EXISTS settlements (
    id           TEXT PRIMARY KEY,
    amount_eur   REAL NOT NULL,
    rate         REAL NOT NULL,
    amount_etb   REAL NOT NULL,
    bank_name    TEXT NOT NULL,
    beneficiary  TEXT NOT NULL,
    cbe_ref      TEXT NOT NULL,
    settled_mins INTEGER NOT NULL,
    created_at   TEXT DEFAULT (datetime('now'))
  );
`);
try { db.exec(`ALTER TABLE settlements ADD COLUMN account_number TEXT`); } catch(e) {}
try { db.exec(`ALTER TABLE settlements ADD COLUMN sender_name TEXT`); } catch(e) {}
try { db.exec(`ALTER TABLE settlements ADD COLUMN transfer_type TEXT DEFAULT 'Standard'`); } catch(e) {}
try { db.exec(`ALTER TABLE settlements ADD COLUMN notes TEXT`); } catch(e) {}


// Settlements table stores ONLY real transfers created by the operator


// Seed default exchange rates (EUR, USD, GBP)
const seedRates = [
  { currency: 'EUR', symbol: '€', rate: 144.50 },
  { currency: 'USD', symbol: '$', rate: 128.00 },
  { currency: 'GBP', symbol: '£', rate: 168.00 }
];

for (const r of seedRates) {
  db.prepare(`
    INSERT OR IGNORE INTO exchange_rates (currency, symbol, rate_to_etb, updated_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(r.currency, r.symbol, r.rate);
}

// ── Seed admin user ───────────────────────────────────────────────────────────
const bcrypt = require('bcryptjs');

const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  const adminId = uuidv4();
  db.prepare(`
    INSERT INTO users (id, name, phone, email, password, role, business, verified)
    VALUES (?, ?, ?, ?, ?, 'admin', 'TradeLink HQ', 1)
  `).run(adminId, 'Admin', '0900000000', 'admin@tradelink.et', hash);
  db.prepare('INSERT OR IGNORE INTO trust_scores (user_id) VALUES (?)').run(adminId);
}

module.exports = db;
