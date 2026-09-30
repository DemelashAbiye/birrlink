import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatETB, ScoreBadge, t } from '../utils';
import { Search, ShieldCheck, ShieldOff } from 'lucide-react';

export default function AdminUsers() {
  const { lang } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const load = () => api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  useEffect(load, []);

  const verify = async (id) => {
    await api.patch(`/admin/users/${id}/verify`);
    load();
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !search || [u.name, u.phone, u.business, u.location, u.email]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t(lang, 'User Management', 'ተጠቃሚ አስተዳደር')}</h1>
        <div className="text-sm text-gray-500">{filtered.length} {t(lang,'users','ተጠቃሚዎች')}</div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder={t(lang,'Search name, phone, business...','ስም, ስልክ, ንግድ...')}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {['all','supplier','retailer'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                roleFilter === r ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>{r === 'all' ? t(lang,'All','ሁሉ') : r}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    t(lang,'User','ተጠቃሚ'),
                    t(lang,'Contact','ግንኙነት'),
                    t(lang,'Role','ሚና'),
                    t(lang,'Location','ቦታ'),
                    t(lang,'Trust Score','እምነት ውጤት'),
                    t(lang,'Joined','ተቀላቀለ'),
                    t(lang,'Status','ሁኔታ'),
                    t(lang,'Actions','እርምጃ'),
                  ].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                          u.role === 'supplier' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          {u.business && <p className="text-xs text-gray-500">{u.business}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-gray-700">{u.phone}</p>
                      {u.email && <p className="text-xs text-gray-400">{u.email}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${u.role === 'supplier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {u.role === 'supplier' ? '🏭' : '🏪'} {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.location || '—'}</td>
                    <td className="px-4 py-3">
                      {u.role === 'retailer' && u.trust_score !== undefined
                        ? <div>
                            <ScoreBadge score={u.trust_score} />
                            <p className="text-xs text-gray-400 mt-0.5">{formatETB(u.credit_limit)} limit</p>
                          </div>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.created_at).toLocaleDateString('en-ET', { month:'short', day:'numeric', year:'numeric'})}
                    </td>
                    <td className="px-4 py-3">
                      {u.verified
                        ? <span className="badge bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                            <ShieldCheck size={12} /> {t(lang,'Verified','ተረጋግጧል')}
                          </span>
                        : <span className="badge bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit">
                            <ShieldOff size={12} /> {t(lang,'Unverified','ያልተረጋገጠ')}
                          </span>}
                    </td>
                    <td className="px-4 py-3">
                      {!u.verified && (
                        <button onClick={() => verify(u.id)}
                          className="text-xs bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded-lg transition-colors">
                          {t(lang,'Verify','አረጋግጥ')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">{t(lang,'No users found.','ምንም ተጠቃሚ አልተገኘም።')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
