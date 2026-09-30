import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatETB, ScoreBadge, t } from '../utils';
import { Users, TrendingUp, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyRetailers() {
  const { lang } = useAuth();
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/retailers').then(r => setRetailers(r.data)).finally(() => setLoading(false));
  }, []);

  const totalLimit = retailers.reduce((s, r) => s + (r.credit_limit || 0), 0);
  const verified = retailers.filter(r => r.verified).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t(lang, 'My Retailers', 'ቸርቻሪዎቼ')}</h1>
        <Link to="/invoices/new" className="btn-primary flex items-center gap-2">
          <FileText size={16} /> {t(lang,'New Invoice','አዲስ ደረሰኝ')}
        </Link>
      </div>

      {/* Summary */}
      {retailers.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <Users size={20} className="text-purple-600"/>, label: t(lang,'Total Retailers','ጠቅላላ ቸርቻሪዎች'), value: retailers.length, bg: 'bg-purple-50' },
            { icon: <TrendingUp size={20} className="text-green-600"/>, label: t(lang,'Total Credit Lines','ጠቅላላ የብድር መስመሮች'), value: formatETB(totalLimit), bg: 'bg-green-50' },
            { icon: <Users size={20} className="text-blue-600"/>, label: t(lang,'Verified','ተረጋግጧቸዋል'), value: `${verified} / ${retailers.length}`, bg: 'bg-blue-50' },
          ].map((s, i) => (
            <div key={i} className="card flex items-center gap-3">
              <div className={`${s.bg} p-2.5 rounded-xl shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
       retailers.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t(lang,'No retailers yet','ምንም ቸርቻሪ የለም')}</p>
          <p className="text-sm mb-4">{t(lang,'Create your first invoice to add a retailer.','የመጀመሪያ ደረሰኝ ፍጠሩ።')}</p>
          <Link to="/invoices/new" className="btn-primary inline-flex items-center gap-2">
            <FileText size={16} /> {t(lang,'Create Invoice','ደረሰኝ ፍጠር')}
          </Link>
        </div>
       ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {retailers.map(r => (
            <div key={r.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{r.name}</p>
                    {r.business && <p className="text-sm text-gray-500">{r.business}</p>}
                  </div>
                </div>
                {r.verified
                  ? <span className="badge bg-green-100 text-green-700">✅ {t(lang,'Verified','ተረጋግጧል')}</span>
                  : <span className="badge bg-yellow-100 text-yellow-700">⚠️ {t(lang,'Unverified','ያልተረጋገጠ')}</span>
                }
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">📞 {r.phone}</span>
                  {r.location && <span className="text-gray-400 text-xs">📍 {r.location}</span>}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-gray-400">{t(lang,'Trust Score','እምነት ውጤት')}</p>
                    <ScoreBadge score={r.trust_score} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{t(lang,'Credit Limit','የብድር ገደብ')}</p>
                    <p className="font-bold text-green-700">{formatETB(r.credit_limit)}</p>
                  </div>
                </div>
              </div>

              <Link to={`/invoices/new`}
                className="mt-3 w-full btn-secondary text-center text-sm flex items-center justify-center gap-1.5">
                <FileText size={14} /> {t(lang,'Create Invoice','ደረሰኝ ፍጠር')}
              </Link>
            </div>
          ))}
        </div>
       )}
    </div>
  );
}
