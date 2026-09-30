import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { t, formatETB } from '../utils';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

export default function MyScore() {
  const { lang } = useAuth();
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me/score').then(r => setScore(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;
  if (!score) return null;

  const s = score.computed ?? 0;
  const color = s >= 75 ? '#16a34a' : s >= 50 ? '#d97706' : '#dc2626';
  const tier = s >= 75 ? { en: 'Excellent', am: 'እጅግ ጥሩ' } : s >= 50 ? { en: 'Fair', am: 'ጥሩ' } : { en: 'Low Risk', am: 'ዝቅተኛ' };

  const criteria = [
    { label: { en: 'On-time Repayments', am: 'በጊዜ ክፍያዎች' }, value: score.on_time, max: score.total_invoices || 1, type: 'count' },
    { label: { en: 'Late Repayments', am: 'ዘግይቶ ክፍያዎች' }, value: score.late, type: 'late' },
    { label: { en: 'Defaults', am: 'ያልተከፈሉ' }, value: score.defaulted, type: 'default' },
    { label: { en: 'Total Invoices', am: 'ጠቅላላ ደረሰኞች' }, value: score.total_invoices, type: 'info' },
    { label: { en: 'Total Volume', am: 'ጠቅላላ መጠን' }, value: formatETB(score.total_volume), type: 'info' },
  ];

  const limits = [
    { range: '80–100', label: 'Excellent', limit: 'ETB 50,000', color: 'bg-green-100 text-green-800' },
    { range: '60–79', label: 'Good', limit: 'ETB 30,000', color: 'bg-blue-100 text-blue-800' },
    { range: '40–59', label: 'Fair', limit: 'ETB 15,000', color: 'bg-yellow-100 text-yellow-800' },
    { range: '0–39', label: 'Low', limit: 'Not eligible', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t(lang,'My Trust Score','የእምነት ውጤቴ')}</h1>

      {/* Score gauge */}
      <div className="card text-center">
        <div className="relative inline-block">
          <ResponsiveContainer width={200} height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
              data={[{ value: s, fill: color }]} startAngle={180} endAngle={0}>
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f3f4f6' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-10">
            <span className="text-5xl font-black" style={{ color }}>{s.toFixed(0)}</span>
            <span className="text-gray-400 text-sm">/ 100</span>
          </div>
        </div>
        <p className="text-xl font-bold mt-2" style={{ color }}>
          {lang === 'am' ? tier.am : tier.en}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-left border-t pt-4">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">{t(lang,'Credit Limit','የብድር ገደብ')}</p>
            <p className="text-xl font-bold text-green-700">{formatETB(score.credit_limit)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">{t(lang,'Financing Eligible','ፋይናንስ ብቁ')}</p>
            <p className="text-xl font-bold text-blue-700">{s >= 40 ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="card">
        <h2 className="font-semibold mb-4">{t(lang,'Score Breakdown','ውጤት ዝርዝር')}</h2>
        <div className="space-y-3">
          {criteria.map((c, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm text-gray-600">{lang === 'am' ? c.label.am : c.label.en}</span>
              <span className={`font-semibold text-sm px-2 py-0.5 rounded-full ${
                c.type === 'late' ? 'bg-yellow-100 text-yellow-800' :
                c.type === 'default' ? 'bg-red-100 text-red-800' :
                c.type === 'count' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-700'
              }`}>{typeof c.value === 'number' && c.max ? `${c.value} / ${c.max}` : c.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Credit tiers */}
      <div className="card">
        <h2 className="font-semibold mb-4">{t(lang,'Credit Tiers','የብድር ደረጃዎች')}</h2>
        <div className="space-y-2">
          {limits.map((l, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${l.color} ${s >= parseInt(l.range) && s <= parseInt(l.range.split('–')[1]) ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
              <span className="font-medium">{l.label} <span className="font-normal opacity-70">({l.range})</span></span>
              <span className="font-bold">{l.limit}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {t(lang,'Score improves with on-time repayments and increased transaction volume.','ውጤቱ በጊዜ ክፍያዎች እና በጨመረ የግብይት ብዛት ይሻሻላል።')}
        </p>
      </div>
    </div>
  );
}
