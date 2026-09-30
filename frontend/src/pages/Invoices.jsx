import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatETB, formatCurrency, StatusBadge, formatDate, t } from '../utils';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';

export default function Invoices() {
  const { user, lang } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const nav = useNavigate();

  const load = () => {
    api.get('/invoices').then(r => setInvoices(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const confirm = async id => {
    if (!window.confirm('Confirm receipt of goods for this invoice?')) return;
    await api.patch(`/invoices/${id}/confirm`);
    load();
  };
  const requestFinance = async id => {
    if (!window.confirm('Request financing (80% advance) for this invoice?')) return;
    try {
      const r = await api.post(`/invoices/${id}/request-finance`);
      alert(`✅ Finance requested! Advance: ${formatETB(r.data.advance_amount)} | Retailer score: ${r.data.retailer_score?.toFixed(0)}`);
      load();
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };
  const repay = async id => {
    if (!window.confirm('Mark this invoice as repaid?')) return;
    const r = await api.post(`/invoices/${id}/repay`);
    alert(`✅ Repaid! New trust score: ${r.data.new_trust_score?.toFixed(0)} | On time: ${r.data.on_time ? 'Yes' : 'No'}`);
    load();
  };

  const filtered = invoices.filter(i => {
    const matchStatus = filter === 'all' || i.status === filter;
    const matchSearch = !search || [i.supplier_name, i.retailer_name, i.id].some(
      v => v?.toLowerCase().includes(search.toLowerCase())
    );
    return matchStatus && matchSearch;
  });

  const statuses = ['all', 'pending', 'confirmed', 'financing_requested', 'financed', 'repaid'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t(lang,'Invoices','ደረሰኞች')}</h1>
        {user.role === 'supplier' && (
          <Link to="/invoices/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> {t(lang,'New Invoice','አዲስ ደረሰኝ')}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder={t(lang,'Search...','ፈልግ...')}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {s === 'all' ? t(lang,'All','ሁሉ') : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
        filtered.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <p>{t(lang,'No invoices found.','ምንም ደረሰኝ አልተገኘም።')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(inv => (
              <div key={inv.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-400">#{inv.id.slice(0,8)}</span>
                      <StatusBadge status={inv.status} lang={lang} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {user.role !== 'supplier' && <span>🏭 <strong>{inv.supplier_name}</strong> {inv.supplier_business && `· ${inv.supplier_business}`}</span>}
                      {user.role !== 'retailer' && <span>🏪 <strong>{inv.retailer_name}</strong> {inv.retailer_business && `· ${inv.retailer_business}`}</span>}
                      {user.role === 'admin' && <><span>🏭 {inv.supplier_name}</span><span>🏪 {inv.retailer_name}</span></>}
                    </div>
                    {inv.description && <p className="text-sm text-gray-500 mt-1">{inv.description}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>{t(lang,'Due','ቀን')}: <strong className="text-gray-700">{formatDate(inv.due_date)}</strong></span>
                      {inv.financed_at && <span>{t(lang,'Financed','ፋይናንስ')}: {formatDate(inv.financed_at)}</span>}
                      {inv.repaid_at && <span>{t(lang,'Repaid','ተከፍሏል')}: {formatDate(inv.repaid_at)}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(inv.amount, inv.currency || 'ETB')}
                    </p>
                    {inv.currency && inv.currency !== 'ETB' && inv.amount_etb && (
                      <p className="text-xs font-mono text-emerald-600">
                        ≈ {formatETB(inv.amount_etb)}
                      </p>
                    )}
                    {inv.advance_amount && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Advance: {formatCurrency(inv.advance_amount, inv.currency || 'ETB')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t flex-wrap">
                  {user.role === 'retailer' && inv.status === 'pending' && (
                    <button onClick={() => confirm(inv.id)} className="btn-primary text-sm py-1.5">
                      ✅ {t(lang,'Confirm Receipt','ደርሷል ያረጋግጡ')}
                    </button>
                  )}
                  {user.role === 'supplier' && inv.status === 'confirmed' && (
                    <button onClick={() => requestFinance(inv.id)} className="btn-primary text-sm py-1.5">
                      💰 {t(lang,'Request Finance (80%)','ፋይናንስ ይጠይቁ (80%)')}
                    </button>
                  )}
                  {user.role === 'retailer' && inv.status === 'financed' && (
                    <button onClick={() => repay(inv.id)} className="btn-primary text-sm py-1.5">
                      💳 {t(lang,'Repay','ይክፈሉ')}
                    </button>
                  )}
                  <button onClick={() => nav(`/invoices/${inv.id}`)} className="btn-secondary text-sm py-1.5">
                    {t(lang,'View Details','ዝርዝር ይመልከቱ')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
