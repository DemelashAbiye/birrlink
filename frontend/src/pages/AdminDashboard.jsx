import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { t, formatETB, ScoreBadge } from '../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, DollarSign, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { lang } = useAuth();
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([
    api.get('/admin/dashboard'),
    api.get('/admin/finance-requests'),
  ]).then(([s, r]) => { setStats(s.data); setRequests(r.data); })
    .finally(() => setLoading(false));
  useEffect(load, []);

  const approve = async id => {
    if (!window.confirm('Approve this financing request?')) return;
    await api.post(`/invoices/${id}/approve-finance`);
    load();
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  const kpis = stats ? [
    { icon: <Users size={22} className="text-blue-600" />, label: t(lang,'Total Users','ጠቅላላ ተጠቃሚዎች'), value: stats.users.total, sub: `${stats.users.suppliers} suppliers · ${stats.users.retailers} retailers`, bg: 'bg-blue-50' },
    { icon: <FileText size={22} className="text-purple-600" />, label: t(lang,'Total Invoices','ጠቅላላ ደረሰኞች'), value: stats.invoices.total, sub: `${stats.invoices.financed} financed · ${stats.invoices.repaid} repaid`, bg: 'bg-purple-50' },
    { icon: <DollarSign size={22} className="text-green-600" />, label: t(lang,'Total Volume','ጠቅላላ ገንዘብ'), value: formatETB(stats.volume.total), sub: `Advanced: ${formatETB(stats.volume.advanced)}`, bg: 'bg-green-50' },
    { icon: <AlertTriangle size={22} className="text-red-600" />, label: t(lang,'Overdue Invoices','ጊዜ ያለፋቸው'), value: stats.invoices.overdue, sub: 'Need immediate attention', bg: 'bg-red-50' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t(lang,'Admin Dashboard','አስተዳዳሪ ዳሽቦርድ')}</h1>
        <div className="flex gap-2">
          <Link to="/admin/users" className="btn-secondary text-sm">{t(lang,'Users','ተጠቃሚዎች')}</Link>
          <Link to="/admin/overdue" className="btn-danger text-sm">{t(lang,'Overdue','ጊዜ ያለፋቸው')}</Link>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="card">
            <div className={`${k.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>{k.icon}</div>
            <p className="text-2xl font-bold">{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Finance requests queue */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{t(lang,'Pending Finance Requests','የሚጠበቁ የፋይናንስ ጥያቄዎች')}
            {requests.length > 0 && <span className="ml-2 badge bg-purple-100 text-purple-700">{requests.length}</span>}
          </h2>
          <Link to="/admin/requests" className="text-sm text-green-700 hover:underline">{t(lang,'View all','ሁሉ ይመልከቱ')}</Link>
        </div>
        {requests.length === 0 ? (
          <p className="text-gray-400 text-sm">{t(lang,'No pending requests.','ምንም ጥያቄ የለም።')}</p>
        ) : (
          <div className="space-y-3">
            {requests.slice(0,5).map(r => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-semibold">#{r.id.slice(0,8)} · {formatETB(r.amount)}</p>
                  <p className="text-xs text-gray-500">
                    🏭 {r.supplier_name} → 🏪 {r.retailer_name}
                    <span className="ml-2"><ScoreBadge score={r.retailer_trust_score} /></span>
                  </p>
                  <p className="text-xs text-gray-400">Advance: {formatETB(r.advance_amount)} · Due: {r.due_date}</p>
                </div>
                <button onClick={() => approve(r.id)} className="btn-primary text-sm py-1.5">
                  ✅ {t(lang,'Approve','ይቀበሉ')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
