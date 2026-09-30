import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils';
import { Edit3, ArrowRightLeft, Check, X, TrendingUp, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ExchangeRateBar() {
  const { user, lang } = useAuth();
  const [eurRate, setEurRate] = useState(144.5);
  const [lastUpdated, setLastUpdated] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  // Form state
  const [newRate, setNewRate] = useState('144.50');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Quick calc state
  const [calcEuro, setCalcEuro] = useState('100');

  const fetchRates = async () => {
    try {
      const { data } = await api.get('/rates');
      const eur = data.find(r => r.currency === 'EUR');
      if (eur) {
        setEurRate(eur.rate_to_etb);
        setNewRate(eur.rate_to_etb.toString());
        if (eur.updated_at) setLastUpdated(eur.updated_at);
      }
    } catch (e) {
      console.error('Error fetching rates:', e);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newRate || isNaN(newRate) || parseFloat(newRate) <= 0) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.post('/rates/update', {
        currency: 'EUR',
        rate_to_etb: parseFloat(newRate),
      });
      setSuccessMsg(t(lang, 'Euro exchange rate updated!', 'የዩሮ ዕለታዊ ምንዛሬ ተቀይሯል!'));
      await fetchRates();
      setTimeout(() => {
        setSuccessMsg('');
        setModalOpen(false);
      }, 1500);
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update rate');
    } finally {
      setSaving(false);
    }
  };

  const isOperator = Boolean(
    user && (
      user.role === 'admin' ||
      user.phone === '+33773552239' ||
      user.phone === '0900000000' ||
      user.email === 'demelash.deguale@etu.emse.fr' ||
      user.email === 'dadtegy@gmail.com'
    )
  );

  return (
    <div className="bg-emerald-950 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-900/60 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Live Euro Rate ticker */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <TrendingUp size={14} className="text-emerald-400 animate-pulse" />
            <span>{t(lang, "Today's Euro Rate", 'የዕለቱ የዩሮ ምንዛሬ')}:</span>
          </div>

          <span className="inline-flex items-center gap-1.5 bg-emerald-900/90 px-3 py-1 rounded-md font-mono border border-emerald-700/60 shadow-sm">
            <span className="text-sm">🇪🇺</span>
            <span className="font-bold text-white text-sm">1 EUR = {eurRate.toFixed(2)} ETB</span>
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-300/80 bg-emerald-900/40 px-2 py-0.5 rounded">
            <ShieldCheck size={12} className="text-emerald-400" />
            {t(lang, 'Verified Rate Lock', 'የተረጋገጠ የዋጋ ዋስትና')}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Quick converter toggle */}
          <button
            onClick={() => setCalcOpen(!calcOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 transition-colors font-medium border border-emerald-700/40"
          >
            <ArrowRightLeft size={13} />
            <span>EUR ↔ ETB {t(lang, 'Calculator', 'መቀየሪያ')}</span>
          </button>

          {/* Update Rate button — Strictly visible ONLY to Operator (Demelash / Admin) */}
          {isOperator && (
            <button
              onClick={() => {
                setNewRate(eurRate.toString());
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-sm"
              title="Operator controls: Update live exchange rate"
            >
              <Edit3 size={12} />
              <span>{t(lang, 'Update Daily Rate', 'የዕለቱን ዋጋ ቀይር')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Calculator Dropdown Banner */}
      {calcOpen && (
        <div className="mt-2 pt-2 border-t border-emerald-800/60 flex items-center justify-between gap-4 flex-wrap bg-emerald-900/40 p-2.5 rounded-lg">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span>💶 Euro (€):</span>
            <input
              type="number"
              value={calcEuro}
              onChange={e => setCalcEuro(e.target.value)}
              className="w-28 px-2 py-1 rounded bg-emerald-950 border border-emerald-700 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="100"
            />
            <span className="text-emerald-400 font-bold">➔</span>
            <span>🇪🇹 Ethiopian Birr:</span>
            <span className="font-mono text-white font-bold text-sm bg-emerald-950 px-2.5 py-1 rounded border border-emerald-700 text-emerald-300">
              ETB {((parseFloat(calcEuro) || 0) * eurRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-emerald-400 opacity-80">
              (@ {eurRate.toFixed(2)} ETB/€)
            </span>
          </div>
          <button onClick={() => setCalcOpen(false)} className="text-emerald-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Modal: Update Daily Euro Rate */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-gray-800">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💶</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {t(lang, "Set Today's Euro Rate", 'የዕለቱን የዩሮ ዋጋ አስገባ')}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {t(lang, 'Updates rate for all calculations & receipts', 'ለሁሉም ደረሰኞችና ስሌቶች ዋጋውን ያድሳል')}
                  </p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {successMsg ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                <Check size={18} /> {successMsg}
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">
                      {t(lang, 'Community Transparency Guarantee', 'የማህበረሰብ እምነት ማረጋገጫ')}
                    </strong>
                    {t(lang, 'Customers in your WhatsApp group can view and verify this rate in real-time.', 'በዋትስአፕ ግሩፕ ያሉ ደንበኞች ይህን ዋጋ በቀጥታ ማረጋገጥ ይችላሉ።')}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t(lang, '1 Euro (€) = How many Ethiopian Birr (ETB)?', '1 ዩሮ (€) = ስንት የኢትዮጵያ ብር (ETB)?')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">ETB</span>
                    <input
                      type="number"
                      step="0.01"
                      className="input pl-12 text-lg font-bold font-mono text-emerald-800"
                      value={newRate}
                      onChange={e => setNewRate(e.target.value)}
                      placeholder="e.g. 144.50"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-secondary flex-1 text-sm py-2"
                  >
                    {t(lang, 'Cancel', 'ይቅር')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1.5"
                  >
                    {saving ? t(lang, 'Updating...', 'እየቀየረ...') : t(lang, 'Lock Rate', 'ዋጋውን መዝግብ')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
