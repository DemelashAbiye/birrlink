export const t = (lang, en, am) => lang === 'am' && am ? am : en;

export const STATUS_LABELS = {
  pending: { en: 'Pending Confirmation', am: 'ማረጋገጫ ይጠብቃል', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { en: 'Confirmed', am: 'ተረጋግጧል', color: 'bg-blue-100 text-blue-800' },
  financing_requested: { en: 'Finance Requested', am: 'ፋይናንስ ተጠይቋል', color: 'bg-purple-100 text-purple-800' },
  financed: { en: 'Financed', am: 'ፋይናንስ ተደርጓል', color: 'bg-green-100 text-green-800' },
  repaid: { en: 'Repaid', am: 'ተከፍሏል', color: 'bg-gray-100 text-gray-700' },
  overdue: { en: 'Overdue', am: 'ጊዜ አልፏል', color: 'bg-red-100 text-red-800' },
  cancelled: { en: 'Cancelled', am: 'ተሰርዟል', color: 'bg-gray-100 text-gray-500' },
};

export function StatusBadge({ status, lang = 'en' }) {
  const s = STATUS_LABELS[status] || { en: status, am: status, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`badge ${s.color}`}>
      {lang === 'am' ? s.am : s.en}
    </span>
  );
}

export function ScoreBadge({ score }) {
  const color =
    score >= 75 ? 'bg-green-100 text-green-800' :
    score >= 50 ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800';
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Fair' : 'Low';
  return (
    <span className={`badge ${color}`}>{label} ({score?.toFixed(0)})</span>
  );
}

export function formatETB(n) {
  return `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;
}

export function formatCurrency(amount, currency = 'ETB') {
  if (currency === 'EUR') return `€${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (currency === 'USD') return `$${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (currency === 'GBP') return `£${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `ETB ${Number(amount || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;
}

export function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-ET', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
}
