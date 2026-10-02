import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatETB, StatusBadge, formatDate } from '../utils';
import { t } from '../utils';
import {
  TrendingUp, FileText, Clock, CheckCircle, DollarSign, Users, ShieldCheck,
  ExternalLink, ArrowRightLeft, Sparkles, Building2, Smartphone, Star,
  MessageCircle, AlertCircle, RefreshCw, Zap, Receipt, TestTube, CheckCircle2, ChevronRight, Trash2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import AcademicVerificationModal from '../components/AcademicVerificationModal';
import DigitalReceiptModal from '../components/DigitalReceiptModal';
import AboutContactSection from '../components/AboutContactSection';
import { CbeLogo, TelebirrLogo, AwashLogo, BoaLogo, DashenLogo } from '../components/EthiopianBankLogos';
import BirrLinkLogo, { BirrLinkIcon } from '../components/BirrLinkLogo';

export default function Dashboard() {
  const { user, lang } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [eurRate, setEurRate] = useState(144.50);
  const [calcEuro, setCalcEuro] = useState('100');
  const [payoutRail, setPayoutRail] = useState('Commercial Bank of Ethiopia (CBE)');
  const [settlements, setSettlements] = useState([]);

  useEffect(() => {
    Promise.all([
      user ? api.get('/invoices').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      user?.role === 'retailer' ? api.get('/users/me/score').catch(() => null) : Promise.resolve(null),
      api.get('/rates').catch(() => ({ data: [] })),
      api.get('/users/settlements').catch(() => ({ data: [] }))
    ]).then(([inv, sc, ratesRes, setRes]) => {
      setInvoices(inv.data || []);
      if (sc) setScore(sc.data);
      const eur = ratesRes.data?.find(r => r.currency === 'EUR');
      if (eur) setEurRate(eur.rate_to_etb);
      if (setRes.data) setSettlements(setRes.data);
    }).finally(() => setLoading(false));
  }, [user]);

  const [deletingId, setDeletingId] = useState(null);

  const handleReceiptCreated = (newReceipt) => {
    setSettlements(prev => [newReceipt, ...prev]);
  };

  const handleDeleteSettlement = async (item) => {
    const confirmed = window.confirm(
      lang === 'am'
        ? `እርግጠኛ ነዎት ይህን ልውውጥ #${item.id} (ለ ${item.beneficiary}) እስከመጨረሻው ማጥፋት ይፈልጋሉ? ይህ እርምጃ አይቀለበስም።`
        : `Are you sure you want to permanently delete transaction #${item.id} for ${item.beneficiary}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      await api.delete(`/users/settlements/${item.id}`);
      setSettlements(prev => prev.filter(s => s.id !== item.id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  const total = invoices.length;
  const pending = invoices.filter(i => i.status === 'pending').length;
  const financed = invoices.filter(i => ['financed', 'repaid'].includes(i.status)).length;
  const totalVolume = invoices.reduce((s, i) => s + i.amount, 0);
  const recent = invoices.slice(0, 5);

  const chartData = ['pending', 'confirmed', 'financed', 'repaid', 'overdue'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: invoices.filter(i => i.status === s).length,
  })).filter(d => d.count > 0);

  const COLORS = { Pending: '#f59e0b', Confirmed: '#3b82f6', Financed: '#10b981', Repaid: '#6b7280', Overdue: '#ef4444' };

  const parsedEuro = parseFloat(calcEuro) || 0;
  const estimatedBirr = parsedEuro * eurRate;
  const isPilot = calcEuro === '20';

  const isOperator = Boolean(
    user && (
      user.role === 'admin' ||
      user.phone === '+33773552239' ||
      user.phone === '0900000000' ||
      user.email === 'demelash.deguale@etu.emse.fr' ||
      user.email === 'dadtegy@gmail.com'
    )
  );

  const openWhatsAppQuote = () => {
    const msg = isPilot
      ? `Hello Demelash, I am a new customer and would like to start with a €20 Pilot Test transfer at today's rate (1 EUR = ${eurRate.toFixed(2)} ETB) for direct payout of ETB ${(20 * eurRate).toFixed(2)} to ${payoutRail}. Please send your EUR bank details to proceed.`
      : `Hello Demelash, I want to exchange €${calcEuro} at today's rate (1 EUR = ${eurRate.toFixed(2)} ETB) for direct payout of ETB ${estimatedBirr.toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${payoutRail}. Please confirm availability.`;
    window.open(`https://wa.me/33773552239?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <BirrLinkIcon size={46} className="shadow-md shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>{t(lang, `Welcome to BirrLink`, `እንኳን ወደ ቢርሊንክ በደህና መጡ`)}</span>
              <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                EUR ➔ ETB
              </span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              {isOperator
                ? t(lang, 'Operator Session · Demelash Abiye Deguale (Admin)', 'የአስተዳዳሪ መቆጣጠሪያ · ደመላሽ አብዬ ደጓለ')
                : t(lang, 'Verified Europe ➔ Ethiopia Community Exchange Corridor', 'የተረጋገጠ ከአውሮፓ ወደ ኢትዮጵያ ገንዘብ መላኪያ መድረክ')}
            </p>
          </div>
        </div>
        {isOperator && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setReceiptModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 font-bold text-xs border border-emerald-500/40 shadow-sm transition-all"
              title="Operator controls: Issue authentic digital receipt"
            >
              <Receipt size={16} />
              <span>{t(lang, '+ Generate Digital Receipt', '+ ዲጂታል ደረሰኝ አዘጋጅ')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Real, Verifiable European Academic Identity Card */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white rounded-3xl p-6 border-2 border-emerald-500/50 shadow-xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 left-24 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-inner">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-400/40 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  {t(lang, 'Real, Verifiable European Academic Identity', 'በአውሮፓ የተረጋገጠ ህጋዊ ተማሪ እና አስተባባሪ')}
                </span>
                <span className="text-xs text-emerald-100 font-medium">
                  Saint-Étienne, France 🇫🇷
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1.5 tracking-tight">
                Demelash Abiye Deguale
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Master's Candidate in Sustainable Manufacturing · <strong>École des Mines Saint-Étienne</strong> (EMJM meta4.0)
              </p>
            </div>
          </div>

          <div className="bg-emerald-900/80 border border-emerald-500/50 rounded-2xl px-5 py-3 text-center sm:text-right shrink-0 flex flex-col items-center sm:items-end justify-between gap-2.5 backdrop-blur-md shadow-lg">
            <div>
              <p className="text-[11px] text-emerald-300 font-bold">{t(lang, 'Verified Operator Status', 'የተረጋገጠ አስተባባሪ')}</p>
              <p className="text-sm font-black text-white">{t(lang, '100% Academic Trust Guarantee', 'የማይቀየር የህጋዊነት ዋስትና')}</p>
              <p className="text-[10px] text-emerald-200">{t(lang, 'Erasmus Mundus Scholar in France', 'የኤራስመስ ሙንዱስ ምሁር በፈረንሳይ')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProofModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md transform hover:scale-105 active:scale-95"
              >
                <ShieldCheck size={14} />
                <span>{t(lang, 'Inspect Official Proof', 'ህጋዊ ማስረጃውን መርምር')}</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Academic Verification Proof Modal */}
      <AcademicVerificationModal
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
      />

      {/* Digital Receipt Generator Modal */}
      <DigitalReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        eurRate={eurRate}
        onReceiptCreated={handleReceiptCreated}
      />

      {/* Live Payout Calculator & Settlement Estimator with Rich Interactive Emerald-Teal Colors */}
      <div className="bg-gradient-to-br from-[#0f766e] via-[#047857] to-[#115e59] border-2 border-emerald-300 text-white p-6 sm:p-7 shadow-2xl rounded-3xl relative overflow-hidden space-y-5">
        {/* Soft Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-300/25 rounded-full blur-3xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-400/40 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <BirrLinkIcon size={44} className="shadow-lg shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{t(lang, 'BirrLink Instant Payout Estimator', 'የቢርሊንክ ፈጣን የክፍያ ማስያ')}</span>
                <span className="text-xs bg-amber-400 text-slate-950 font-mono px-2 py-0.5 rounded-full font-black">
                  Live ⚡
                </span>
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                {t(lang, '0% Hidden Fees · 10-Minute SLA Guaranteed · Live Rate Locked', '0% የተደበቀ ክፍያ · በ 10 ደቂቃ ውስጥ ለቤተሰብ የመድረስ ዋስትና')}
              </p>
            </div>
          </div>
          <div className="bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full font-mono text-xs font-black shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
            <span>1 EUR = {eurRate.toFixed(2)} ETB</span>
          </div>
        </div>

        {/* Interactive Pilot Callout Banner */}
        <div className="bg-gradient-to-r from-amber-500/25 via-emerald-600/30 to-teal-600/25 border-2 border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white shadow-lg backdrop-blur-md relative z-10 transition-all hover:border-amber-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-amber-400/20 border border-amber-300/50 text-amber-200">🧪</span>
            <div>
              <span className="font-black text-amber-300 text-sm">
                {t(lang, 'First-Time Customer? Start with a €20 Pilot Test', 'አዲስ ደንበኛ ኖት? በ €20 የሙከራ ልውውጥ ይጀምሩ')}
              </span>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                {t(lang, 'Send €20 first. Confirm your family in Ethiopia receives the Birr within 10 minutes before doing larger amounts.', 'በመጀመሪያ €20 ብቻ በመላክ በ 10 ደቂቃ ውስጥ ለቤተሰብዎ መድረሱን ያረጋግጡ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCalcEuro('20')}
            className={`shrink-0 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-md transform hover:scale-105 active:scale-95 ${
              isPilot
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-200 shadow-amber-400/50'
                : 'bg-amber-400/30 hover:bg-amber-400/50 text-amber-200 border border-amber-300/60'
            }`}
          >
            {isPilot ? '✓ €20 Pilot Active' : '🧪 Try €20 Pilot Test'}
          </button>
        </div>

        {/* Interactive Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch relative z-10">
          {/* Euro Amount with Stepper and Interactive Slider */}
          <div className="bg-[#064e3b]/70 border-2 border-emerald-300/40 hover:border-emerald-300 rounded-2xl p-4 space-y-3 flex flex-col justify-between shadow-lg backdrop-blur-md transition-all">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-emerald-100 font-bold block">
                  {t(lang, 'You Send (Euro €):', 'የሚልኩት የዩሮ መጠን (€):')}
                </label>
                <span className="text-xs font-mono text-amber-300 font-bold">€{calcEuro || 0}</span>
              </div>

              {/* Number Input with Stepper */}
              <div className="relative mt-1.5 flex items-center">
                <span className="absolute left-3.5 text-amber-300 font-black text-lg">€</span>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="5"
                  value={calcEuro}
                  onChange={e => setCalcEuro(e.target.value)}
                  className="w-full bg-[#033b2c] border-2 border-emerald-400/70 rounded-xl pl-9 pr-14 py-2 text-xl font-black text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-inner"
                  placeholder="100"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCalcEuro(prev => Math.max(10, (parseFloat(prev) || 0) - 20).toString())}
                    className="w-6 h-6 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold border border-emerald-400/50 flex items-center justify-center text-xs transition-colors"
                    title="- €20"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcEuro(prev => ((parseFloat(prev) || 0) + 50).toString())}
                    className="w-6 h-6 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold border border-emerald-400/50 flex items-center justify-center text-xs transition-colors"
                    title="+ €50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Interactive Range Slider */}
              <div className="pt-2">
                <input
                  type="range"
                  min="20"
                  max="1500"
                  step="10"
                  value={calcEuro || 20}
                  onChange={e => setCalcEuro(e.target.value)}
                  className="w-full h-1.5 bg-[#033b2c] rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-emerald-200 font-mono mt-0.5">
                  <span>€20</span>
                  <span>€500</span>
                  <span>€1,500</span>
                </div>
              </div>
            </div>

            {/* Interactive Quick Amount Pills */}
            <div className="flex gap-1.5 pt-1 flex-wrap">
              {[
                { amt: '20', label: '€20 (Pilot)' },
                { amt: '50', label: '€50' },
                { amt: '100', label: '€100' },
                { amt: '250', label: '€250' },
                { amt: '500', label: '€500' },
                { amt: '1000', label: '€1000' }
              ].map(item => (
                <button
                  key={item.amt}
                  type="button"
                  onClick={() => setCalcEuro(item.amt)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl border font-mono transition-all transform hover:scale-105 active:scale-95 duration-150 ${
                    calcEuro === item.amt
                      ? item.amt === '20'
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md ring-2 ring-amber-300'
                        : 'bg-white text-emerald-950 border-white font-black shadow-md ring-2 ring-emerald-300'
                      : 'bg-emerald-800/80 text-emerald-100 border-emerald-400/40 hover:bg-emerald-600 hover:text-white font-bold'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Bank / Method */}
          <div className="bg-[#064e3b]/70 border-2 border-emerald-300/40 hover:border-emerald-300 rounded-2xl p-4 space-y-3 flex flex-col justify-between shadow-lg backdrop-blur-md transition-all">
            <div className="space-y-1.5">
              <label className="text-xs text-emerald-100 font-bold block">
                {t(lang, 'Recipient Bank in Ethiopia:', 'የተቀባይ ባንክ ወይም መክፈያ:')}
              </label>
              <select
                value={payoutRail}
                onChange={e => setPayoutRail(e.target.value)}
                className="w-full bg-[#033b2c] border-2 border-emerald-400/70 hover:border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
              >
                <option value="Commercial Bank of Ethiopia (CBE)" className="bg-emerald-900 text-white">Commercial Bank of Ethiopia (CBE)</option>
                <option value="Telebirr SuperApp" className="bg-emerald-900 text-white">Telebirr SuperApp (Ethio Telecom)</option>
                <option value="Awash Bank" className="bg-emerald-900 text-white">Awash Bank</option>
                <option value="Bank of Abyssinia (BOA)" className="bg-emerald-900 text-white">Bank of Abyssinia (BOA)</option>
                <option value="Dashen Bank" className="bg-emerald-900 text-white">Dashen Bank</option>
              </select>
              <div className="p-2.5 rounded-xl bg-emerald-800/70 border border-emerald-400/30 text-[11px] text-emerald-100 font-medium flex items-center gap-2 mt-2">
                <span className="text-base">⚡</span>
                <span>Direct instant deposit with official bank SMS notification</span>
              </div>
            </div>

            {/* Fast preset bank buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { name: 'CBE Bank', rail: 'Commercial Bank of Ethiopia (CBE)', logo: <CbeLogo className="w-4 h-4 shrink-0" /> },
                { name: 'Telebirr', rail: 'Telebirr SuperApp', logo: <TelebirrLogo className="w-4 h-4 shrink-0" /> }
              ].map(b => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setPayoutRail(b.rail)}
                  className={`text-[10px] py-1 px-2 rounded-lg font-bold border flex items-center justify-center gap-1.5 transition-colors ${
                    payoutRail === b.rail
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                      : 'bg-emerald-800/80 text-emerald-100 border-emerald-400/40 hover:bg-emerald-600'
                  }`}
                >
                  {b.logo}
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Luminous Payout Output & Direct WhatsApp Trigger */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white p-5 rounded-2xl shadow-2xl border-2 border-emerald-300/60 flex flex-col justify-between gap-3 text-right relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between text-[11px] text-emerald-100 font-bold mb-1">
                <span className="inline-flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded-md border border-white/30 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  {isPilot ? '🧪 Pilot Test' : 'Locked Net'}
                </span>
                <span>{t(lang, 'Recipient Receives:', 'ተቀባዩ የሚያገኘው:')}</span>
              </div>

              <p className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight drop-shadow-md">
                ETB {estimatedBirr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-100 mt-0.5 font-medium">
                0% Commission · 100% Guaranteed Payout
              </p>
            </div>

            <button
              onClick={openWhatsAppQuote}
              className="w-full font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl bg-amber-400 hover:bg-amber-300 text-slate-950"
            >
              <MessageCircle size={16} />
              <span>
                {isPilot
                  ? t(lang, 'Start €20 Pilot Test on WhatsApp', 'በዋትስአፕ €20 የሙከራ ልውውጥ ጀምር')
                  : t(lang, 'Lock Rate & Initiate on WhatsApp', 'ዋጋውን ቆልፈህ በዋትስአፕ ጀምር')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Zero-Risk Pilot Protocol 3-Step Explainer Card */}
      <div className="bg-gradient-to-br from-[#0d6e53] via-[#095741] to-[#0f766e] border-2 border-emerald-300/60 text-white p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-400/40 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-emerald-700/80 text-white border border-emerald-400/50">
              🛡️
            </span>
            <div>
              <h3 className="font-black text-white text-base">
                {t(lang, 'Zero-Risk Pilot Protocol for New Customers', 'ለአዳዲስ ደንበኞች የዜሮ-ስጋት የሙከራ አሰራር')}
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                {t(lang, 'How we completely eliminate counterparty risk and fear', 'ሁለቱም ወገን ሳይፈራ በልበ ሙሉነት የሚገበያዩበት')}
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-white/20 text-white px-3 py-1 rounded-full font-mono border border-white/30 font-bold">
            Step-by-Step Trust Framework
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div
            onClick={() => setCalcEuro('20')}
            className="bg-[#064736]/80 hover:bg-[#07533f] border-2 border-amber-400 p-4.5 rounded-2xl space-y-2 backdrop-blur-md shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                <span>Small €20 Pilot Test</span>
              </div>
              <span className="text-[10px] text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                Click to Select ➔
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/90 leading-relaxed">
              Don't risk €500 or €1,000 on day one. Send only €20 as a low-risk trial to test our execution speed.
            </p>
          </div>

          <div className="bg-[#064736]/80 hover:bg-[#07533f] border-2 border-emerald-400/70 p-4.5 rounded-2xl space-y-2 backdrop-blur-md shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center gap-2 text-emerald-200 font-bold text-xs">
              <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
              <span>10-Min Payout & Digital Slip</span>
            </div>
            <p className="text-[11px] text-emerald-100/90 leading-relaxed">
              We credit the exact equivalent Birr at today's locked rate directly to your recipient's CBE / Telebirr within 10 minutes, along with an official digital receipt.
            </p>
          </div>

          <div className="bg-[#064736]/80 hover:bg-[#07533f] border-2 border-teal-300/70 p-4.5 rounded-2xl space-y-2 backdrop-blur-md shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center gap-2 text-teal-200 font-bold text-xs">
              <span className="w-6 h-6 rounded-full bg-teal-300 text-slate-950 flex items-center justify-center text-xs font-black">3</span>
              <span>Exchange Full Amount With Ease</span>
            </div>
            <p className="text-[11px] text-emerald-100/90 leading-relaxed">
              Once your recipient in Ethiopia confirms funds in hand, exchange the remainder with 100% confidence.
            </p>
          </div>
        </div>
      </div>

      {/* About BirrLink & Direct Clickable Contact Channels (Telegram, WhatsApp, Instagram, Email, Phone) */}
      <AboutContactSection showAbout={true} showContact={true} />

      {/* Recent Verified Digital Receipts & Bank Settlement Slips (Visible Only to Demelash / Admin Operator) */}
      {isOperator && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Receipt size={18} className="text-emerald-600" />
                <span>{t(lang, 'Operator Ledger: Recent Transactions', 'የአስተዳዳሪ መዝገብ፡ የቅርብ ጊዜ ዝውውሮች')}</span>
              </h2>
              <p className="text-xs text-gray-500">
                {t(lang, 'Every transaction generates a tamper-proof digital certificate verifiable by bank SMS reference', 'እያንዳንዱ ልውውጥ በባንክ ሪፈረንስ የተረጋገጠ ህጋዊ ዲጂታል ደረሰኝ አለው')}
              </p>
            </div>
            <button
              onClick={() => setReceiptModalOpen(true)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
              title="Operator: Issue digital receipt"
            >
              <span>+ Create Receipt</span>
            </button>
          </div>

          {settlements.length === 0 ? (
            <div className="text-center py-8 bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl text-gray-500 text-xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Receipt size={24} />
              </div>
              <p className="font-bold text-gray-800 text-sm">
                {t(lang, 'No Settlements Yet', 'ምንም የተመዘገበ ክፍያ የለም')}
              </p>
              <p className="text-gray-500 max-w-sm mx-auto text-[11px]">
                {t(
                  lang,
                  'Transfers will appear here only when you execute a real settlement and generate an official receipt with an authentic CBE / Telebirr reference code.',
                  'እውነተኛ ልውውጦችን ሲያከናውኑ እና የባንክ ማረጋገጫ ኮድ ሲያስገቡ እዚህ በቀጥታ ይመዘገባሉ።'
                )}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setReceiptModalOpen(true)}
                  className="btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5"
                >
                  <span>{t(lang, '+ Generate First Digital Receipt', '+ የመጀመሪያውን ዲጂታል ደረሰኝ ፍጠር')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-gray-500 text-left">
                    <th className="py-2.5">Receipt ID</th>
                    <th className="py-2.5">Type</th>
                    <th className="py-2.5">Beneficiary / Bank</th>
                    <th className="py-2.5 text-right">Amount (EUR)</th>
                    <th className="py-2.5 text-right">Paid (ETB)</th>
                    <th className="py-2.5 text-center">Bank Reference</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settlements.slice(0, 6).map((s) => {
                    const isPilotRow = s.transfer_type === 'Pilot Test' || s.transfer_type?.includes('Pilot');
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-2.5 font-mono font-bold text-gray-800">
                          #{s.id}
                        </td>
                        <td className="py-2.5">
                          {isPilotRow ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              🧪 Pilot
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              ⚡ Standard
                            </span>
                          )}
                        </td>
                        <td className="py-2.5">
                          <span className="font-semibold text-gray-900 block">{s.beneficiary}</span>
                          <span className="text-[10px] text-gray-400">{s.bank_name}</span>
                        </td>
                        <td className="py-2.5 text-right font-mono font-semibold text-gray-900">
                          €{Number(s.amount_eur).toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-emerald-600">
                          ETB {Number(s.amount_etb).toLocaleString('en-US', { minimumFractionDigits: 1 })}
                        </td>
                        <td className="py-2.5 text-center font-mono text-[11px] text-gray-600">
                          <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {s.cbe_ref}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <Link
                              to={`/receipt/${s.id}`}
                              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold hover:underline"
                            >
                              <span>View Slip</span>
                              <ExternalLink size={11} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteSettlement(s)}
                              disabled={deletingId === s.id}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title={t(lang, 'Admin: Delete transaction', 'አስተዳዳሪ፡ ሰርዝ')}
                            >
                              <Trash2 size={13} className={deletingId === s.id ? 'animate-spin' : ''} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Dedicated Admin Section: Manage & Delete Recent Transactions */}
          {settlements.length > 0 && (
            <div className="mt-4 pt-4 border-t border-rose-100 bg-rose-50/70 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
                  <span className="p-1.5 rounded-lg bg-rose-200 text-rose-800">
                    <Trash2 size={14} />
                  </span>
                  <span>{t(lang, 'Admin Management: Delete Recent Transactions', 'የአስተዳዳሪ ክፍል፡ የቅርብ ጊዜ ልውውጦችን ሰርዝ')}</span>
                  <span className="text-[10px] bg-rose-200 text-rose-900 font-mono px-2 py-0.5 rounded-full font-bold">
                    Demelash Only
                  </span>
                </div>
                <p className="text-[11px] text-rose-700">
                  {t(lang, 'Click "Delete" to permanently remove any transaction from the ledger.', 'ማናቸውንም ልውውጥ ከመዝገቡ እስከመጨረሻው ለማጥፋት "ሰርዝ" የሚለውን ይጫኑ።')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {settlements.map((s) => (
                  <div
                    key={`admin-del-${s.id}`}
                    className="bg-white p-3 rounded-xl border border-rose-200 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-gray-900">#{s.id}</span>
                        <span className="text-[10px] text-gray-500 truncate">· {s.bank_name}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 truncate">{s.beneficiary}</p>
                      <p className="text-[11px] text-emerald-700 font-mono font-medium">
                        €{Number(s.amount_eur).toFixed(2)} ➔ ETB {Number(s.amount_etb).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSettlement(s)}
                      disabled={deletingId === s.id}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                      title={t(lang, 'Delete this transaction', 'ይህን ልውውጥ ሰርዝ')}
                    >
                      <Trash2 size={12} className={deletingId === s.id ? 'animate-spin' : ''} />
                      <span>{deletingId === s.id ? t(lang, 'Deleting...', 'እየሰረዘ...') : t(lang, 'Delete', 'ሰርዝ')}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3-Point Ironclad Reliability Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-emerald-50 border-emerald-200 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <Clock size={18} className="text-emerald-600" />
            <span>10-Minute Payout SLA</span>
          </div>
          <p className="text-xs text-emerald-900/80 leading-relaxed">
            Funds are directly credited to your recipient in Ethiopia within 10 minutes of Euro receipt confirmation.
          </p>
        </div>

        <div className="card bg-blue-50 border-blue-200 space-y-2">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
            <FileText size={18} className="text-blue-600" />
            <span>Official Bank SMS Slip</span>
          </div>
          <p className="text-xs text-blue-900/80 leading-relaxed">
            Every transaction includes the authentic CBE reference (FT...) or Telebirr SMS verifiable in mobile banking.
          </p>
        </div>

        <div className="card bg-purple-50 border-purple-200 space-y-2">
          <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
            <ShieldCheck size={18} className="text-purple-600" />
            <span>100% Rate Lock Promise</span>
          </div>
          <p className="text-xs text-purple-900/80 leading-relaxed">
            No surprise commission or mid-transfer rate changes. The rate you see is the exact Birr amount delivered.
          </p>
        </div>
      </div>

      {/* Supported Ethiopian Payment Rails with Official Logos */}
      <div className="card p-5 space-y-4 overflow-hidden relative border-2 border-emerald-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span className="text-base">🇪🇹</span>
              <span>{t(lang, 'Supported Ethiopian Bank & Mobile Money Rails', 'የሚደገፉ የኢትዮጵያ የባንክና የሞባይል ክፍያ መረቦች')}</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Direct settlement with instant bank SMS reference & verification
            </p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold font-mono px-3 py-1 rounded-full border border-emerald-300">
            ⚡ Direct Instant Settlement
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-center text-xs font-bold">
          {[
            {
              name: 'Commercial Bank of Ethiopia',
              code: 'CBE',
              logo: <CbeLogo className="w-12 h-12 mx-auto mb-2" />,
              badge: 'Most Popular',
              badgeColor: 'bg-purple-100 text-purple-900 border-purple-200'
            },
            {
              name: 'Telebirr SuperApp',
              code: 'Telebirr',
              logo: <TelebirrLogo className="w-12 h-12 mx-auto mb-2" />,
              badge: 'Instant SMS',
              badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-200'
            },
            {
              name: 'Awash Bank',
              code: 'Awash',
              logo: <AwashLogo className="w-12 h-12 mx-auto mb-2" />,
              badge: 'Fast Deposit',
              badgeColor: 'bg-blue-100 text-blue-900 border-blue-200'
            },
            {
              name: 'Bank of Abyssinia',
              code: 'BOA',
              logo: <BoaLogo className="w-12 h-12 mx-auto mb-2" />,
              badge: 'Direct Account',
              badgeColor: 'bg-amber-100 text-amber-900 border-amber-200'
            },
            {
              name: 'Dashen Bank',
              code: 'Dashen',
              logo: <DashenLogo className="w-12 h-12 mx-auto mb-2" />,
              badge: 'Direct Account',
              badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200'
            },
          ].map(r => (
            <div
              key={r.code}
              className="bg-white hover:bg-emerald-50/40 p-3.5 rounded-2xl border-2 border-gray-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {r.logo}
                <span className="text-gray-900 block text-xs font-black tracking-tight">{r.code}</span>
                <span className="text-[10px] text-gray-500 font-medium truncate block leading-tight mt-0.5">{r.name}</span>
              </div>
              <div className="pt-2">
                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                  {r.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
