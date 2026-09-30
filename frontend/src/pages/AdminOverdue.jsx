import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatETB, formatDate, t } from '../utils';
import { AlertTriangle } from 'lucide-react';

export default function AdminOverdue() {
  const { lang } = useAuth();
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/overdue').then(r => setOverdue(r.data)).finally(() => setLoading(false));
  }, []);

  const daysOverdue = (dueDate) => {
    const diff = Math.floor((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const urgencyColor = (days) =>
    days > 30 ? 'border-l-red-600 bg-red-50' :
    days > 14 ? 'border-l-orange-500 bg-orange-50' :
    'border-l-yellow-500 bg-yellow-50';

  const totalExposure = overdue.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-red-700">
          <AlertTriangle size={24} /> {t(lang, 'Overdue Invoices', 'ጊዜ ያለፋቸው ደረሰኞች')}
        </h1>
        {overdue.length > 0 && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-semibold">
            {t(lang,'Total exposure','ጠቅላላ ተጋልጦ')}: {formatETB(totalExposure)}
          </div>
        )}
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
       overdue.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <AlertTriangle size={48} className="mx-auto mb-3 text-green-300" />
          <p className="font-medium">{t(lang,'No overdue invoices!','ጊዜ ያለፋቸው ደረሰኞች የሉም!')}</p>
          <p className="text-sm">{t(lang,'All financed invoices are within their payment window.','ሁሉም ደረሰኞች ወቅቱን ጠብቀዋል።')}</p>
        </div>
       ) : (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t(lang,'Overdue Count','የቁጥር ብዛት'), value: overdue.length, color: 'text-red-700' },
              { label: t(lang,'Total Exposure','ጠቅላላ ብር'), value: formatETB(totalExposure), color: 'text-red-700' },
              { label: t(lang,'Longest Overdue','ረጅሙ ጊዜ'), value: `${daysOverdue(overdue[0]?.due_date)} days`, color: 'text-red-700' },
            ].map((s, i) => (
              <div key={i} className="card bg-red-50 border-red-200">
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Overdue cards */}
          {overdue.map(inv => {
            const days = daysOverdue(inv.due_date);
            return (
              <div key={inv.id} className={`card border-l-4 ${urgencyColor(days)}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">#{inv.id.slice(0,8)}</span>
                      <span className={`badge text-xs ${days > 30 ? 'bg-red-200 text-red-800' : days > 14 ? 'bg-orange-200 text-orange-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {days} {t(lang,'days overdue','ቀናት አልፈዋል')}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>🏭 {t(lang,'Supplier','አቅራቢ')}: <strong>{inv.supplier_name}</strong></p>
                      <p>🏪 {t(lang,'Retailer','ቸርቻሪ')}: <strong>{inv.retailer_name}</strong>
                        <a href={`tel:${inv.retailer_phone}`} className="ml-2 text-blue-600 hover:underline text-xs">
                          📞 {inv.retailer_phone}
                        </a>
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {t(lang,'Was due','ሊከፈልበት ነበር')}: <strong className="text-red-600">{formatDate(inv.due_date)}</strong>
                      &nbsp;·&nbsp;
                      {t(lang,'Financed on','ፋይናንስ ተደረገ')}: {formatDate(inv.financed_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900">{formatETB(inv.amount)}</p>
                    <p className="text-xs text-gray-400">{t(lang,'Outstanding balance','ያልተከፈለ ቀሪ')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
       )}
    </div>
  );
}
