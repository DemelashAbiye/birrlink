/**
 * Trust Score Engine
 * Computes a 0–100 credit score for retailers based on:
 *  - On-time repayment rate (50 pts)
 *  - Total transaction volume (20 pts)
 *  - Account age / number of invoices (20 pts)
 *  - Default penalty (-10 pts per default, floored at 0)
 */

const db = require('../db');

function computeScore(stats) {
  const { total_invoices, on_time, late, defaulted, total_volume } = stats;
  if (total_invoices === 0) return 50; // new user starts at 50

  const repaymentRate = on_time / (on_time + late + defaulted || 1);
  const repaymentScore = repaymentRate * 50;

  const volumeScore = Math.min(total_volume / 100000, 1) * 20; // cap at 100k ETB

  const invoiceScore = Math.min(total_invoices / 20, 1) * 20; // cap at 20 invoices

  const defaultPenalty = defaulted * 10;

  return Math.max(0, Math.min(100, repaymentScore + volumeScore + invoiceScore - defaultPenalty));
}

function getScore(userId) {
  let row = db.prepare('SELECT * FROM trust_scores WHERE user_id = ?').get(userId);
  if (!row) {
    db.prepare('INSERT OR IGNORE INTO trust_scores (user_id) VALUES (?)').run(userId);
    row = db.prepare('SELECT * FROM trust_scores WHERE user_id = ?').get(userId);
  }
  return { ...row, computed: computeScore(row) };
}

function updateScore(userId, { invoicePaid, onTime, amount }) {
  db.prepare('INSERT OR IGNORE INTO trust_scores (user_id) VALUES (?)').run(userId);
  const cur = db.prepare('SELECT * FROM trust_scores WHERE user_id = ?').get(userId);

  const update = {
    total_invoices: cur.total_invoices + (invoicePaid ? 1 : 0),
    on_time: cur.on_time + (onTime ? 1 : 0),
    late: cur.late + (!onTime && invoicePaid ? 1 : 0),
    defaulted: cur.defaulted + (invoicePaid === false ? 1 : 0),
    total_volume: cur.total_volume + (amount || 0),
  };

  const newScore = computeScore(update);

  db.prepare(`
    UPDATE trust_scores SET
      score = ?, total_invoices = ?, on_time = ?, late = ?, defaulted = ?,
      total_volume = ?, updated_at = datetime('now')
    WHERE user_id = ?
  `).run(newScore, update.total_invoices, update.on_time, update.late,
         update.defaulted, update.total_volume, userId);

  return newScore;
}

/** Financing eligibility: score >= 40 and no active defaults */
function isEligible(userId) {
  const data = getScore(userId);
  return { eligible: data.computed >= 40 && data.defaulted === 0, score: data.computed };
}

/** Max credit limit based on score: up to 50k ETB */
function creditLimit(score) {
  if (score >= 80) return 50000;
  if (score >= 60) return 30000;
  if (score >= 40) return 15000;
  return 0;
}

module.exports = { getScore, updateScore, isEligible, creditLimit, computeScore };
