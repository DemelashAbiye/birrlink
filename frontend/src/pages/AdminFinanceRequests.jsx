import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatETB, formatDate, ScoreBadge, t } from '../utils';
import { CheckCircle, Clock } from 'lucide-react';

export default function AdminFinanceRequests() {
  const { lang } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  const load = () => api.get('/admin/finance-requests').then(r => setRequests(r.data)).finally(() => setLoading(false));
  useEffect(load, []);

  const approve = async (id) => {
    if (!window.confirm('Approve this finance request? Funds will be released to the supplier.')) return;
    setApproving(id);
    try {
      await api.post(`/invoices/${id}/approve-finance`);
      load();
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
    finally { setApproving(null); }
  };

  const riskColor = s => s >= 70 ? 'border-l-green-500' : s >= 50 ? 'border-l-yellow-400' : 'border-l-red-500';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t(lang,'Finance Requests','የፋይናንስ ጥያቄዎች')}</h1>
        <span className="badge bg-purple-100 text-purple-700 text-sm px-3 py-1">
          {requests.length} {t(lang,'pending','በጥበቃ ላይ')}
        </span>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
       requests.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <CheckCircle size={48} className="mx-auto mb-3 text-green-300" />
          <p className="font-medium">{t(lang,'No pending requests!','ምንም ጥያቄ የለም!')}</p>
          <p className="text-sm">{t(lang,'All caught up.','ሁሉም ተሠርቷል።')}</p>
        </div>
       ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className={`card border-l-4 ${riskColor(r.retailer_trust_score)}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Invoice info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">#{r.id.slice(0,8)}</span>
                    <Clock size={14} className="text-purple-500" />
                    <span className="text-xs text-purple-600 font-medium">{t(lang,'Awaiting Approval','ፈቃድ ይጠብቃል')}</span>
                  </div>

                  {/* Supplier → Retailer */}
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                      <span>🏭</span>
                      <div>
                        <p className="font-semibold text-blue-900 leading-tight">{r.supplier_name}</p>
                        {r.supplier_business && <p className="text-xs text-blue-500">{r.supplier_business}</p>}
                      </div>
                    </div>
                    <span className="text-gray-400 text-lg">→</span>
                    <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg">
                      <span>🏪</span>
                      <div>
                        <p className="font-semibold text-purple-900 leading-tight">{r.retailer_name}</p>
                        {r.retailer_business && <p className="text-xs text-purple-500">{r.retailer_business}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Retailer trust score */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">{t(lang,'Retailer score','ቸርቻሪ ውጤት')}:</span>
                    <ScoreBadge score={r.retailer_trust_score} />
                    {r.retailer_trust_score < 40 && (
                      <span className="text-red-600 text-xs font-medium">⚠️ {t(lang,'High risk — review carefully','ከፍተኛ አደጋ')}</span>
                    )}
                  </div>

                  {/* Description */}
                  {r.description && <p className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">{r.description}</p>}
                </div>

                {/* Amounts + action */}
                <div className="text-right space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">{t(lang,'Invoice Amount','የደረሰኝ መጠን')}</p>
                    <p className="text-2xl font-black text-gray-900">{formatETB(r.amount)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-sm">
                    <p className="text-xs text-gray-400">{t(lang,'Advance to release','ለአቅራቢ ይለቀቃል')}</p>
                    <p className="text-xl font-bold text-green-700">{formatETB(r.advance_amount)}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {t(lang,'Due','ቀን')}: <span className="font-semibold text-gray-700">{formatDate(r.due_date)}</span>
                  </div>
                  <button
                    onClick={() => approve(r.id)}
                    disabled={approving === r.id}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    {approving === r.id ? t(lang,'Approving...','እየፈቀደ...') : t(lang,'Approve & Release','ፍቀድ እና ለቀቅ')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
       )}
    </div>
  );
}
