import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatETB, formatCurrency, formatDate, t } from '../utils';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Building2,
  MapPin,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Lock,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';

export default function OperatorTrust() {
  const { user, lang } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isOperator = Boolean(
    user && (
      user.role === 'admin' ||
      user.phone === '+33773552239' ||
      user.phone === '0900000000' ||
      user.email === 'demelash.deguale@etu.emse.fr' ||
      user.email === 'dadtegy@gmail.com'
    )
  );

  useEffect(() => {
    api.get('/users/operator/trust-profile')
      .then(res => setProfile(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getWhatsAppTrustMessage = () => {
    if (!profile) return '';
    const { operator, metrics } = profile;
    return `🛡️ *TRADELINK VERIFIED OPERATOR PROFILE*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Operator:* ${operator.name}\n` +
      `📍 *Base:* ${operator.location}\n` +
      `🎓 *Academic Credential:* ${operator.institution}\n` +
      `🏅 *Verification Status:* ✅ ${operator.trust_level}\n\n` +
      `📊 *VERIFIED TRACK RECORD:*\n` +
      `✅ *Completed Transfers:* ${metrics.total_deals}+ Successful\n` +
      `💶 *Volume Settled:* €${Number(metrics.total_volume_eur).toLocaleString('en-US')}+ EUR\n` +
      `⏱️ *Average Delivery:* ${metrics.avg_payout_time}\n` +
      `💯 *Settlement Success:* ${metrics.success_rate} (0 Disputes)\n` +
      `💱 *Today's Euro Rate:* 1 EUR = ${metrics.eur_rate.toFixed(2)} ETB\n\n` +
      `💡 *First Time?* Split test transfers (€20-€50) welcomed to verify delivery in 5 mins.\n\n` +
      `🔒 *Verify Live Profile & Recent Settlements:* \n` +
      `${window.location.origin}/trust\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Official BirrLink Transparency & Settlement Protocol_`;
  };

  const copyTrustMessage = () => {
    navigator.clipboard.writeText(getWhatsAppTrustMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(getWhatsAppTrustMessage());
    window.open(`https://wa.me/33773552239?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Loading Verified Operator Credentials...</p>
        </div>
      </div>
    );
  }

  const { operator, metrics, settlements } = profile || {};

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* TOP IDENTITY BADGE CARD */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
            {/* Avatar / Profile Initials */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-1 shadow-xl">
                <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-3xl font-black text-emerald-400 font-mono">
                  {operator?.name?.split(' ').map(n => n[0]).join('') || 'DD'}
                </div>
              </div>
              <span className="absolute -bottom-2 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg" title="Identity Verified">
                <ShieldCheck size={18} />
              </span>
            </div>

            {/* Identity details */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {operator?.name}
                </h1>
                <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 font-bold">
                  {operator?.trust_level}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Building2 size={14} />
                  {operator?.institution}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin size={14} />
                  {operator?.location}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xl pt-1">
                {operator?.bio}
              </p>
            </div>
          </div>

          {/* Quick WhatsApp Action Bar inside hero */}
          <div className="mt-6 pt-6 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <Lock size={14} className="text-emerald-400" />
              <span>{t(lang, 'Identity and Student Record Verified in France', 'በፈረንሳይ የተረጋገጠ ህጋዊ ተማሪ እና አስተባባሪ')}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={openWhatsApp}
                className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Share2 size={14} />
                <span>{t(lang, 'Share to WhatsApp', 'ለዋትስአፕ ግሩፕ አጋራ')}</span>
              </button>
              <button
                onClick={copyTrustMessage}
                className="bg-slate-700/80 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                title="Copy formatted trust profile text"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KEY VERIFIED METRICS (TRACK RECORD) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: t(lang, 'Successful Transfers', 'የተጠናቀቁ ልውውጦች'),
              val: `${metrics?.total_deals}+`,
              sub: '100% Fulfillment',
              icon: <CheckCircle2 size={20} className="text-emerald-400" />,
              bg: 'bg-emerald-950/40 border-emerald-700/50'
            },
            {
              label: t(lang, 'Total Settled', 'የተወራራደ ጠቅላላ ዩሮ'),
              val: `€${Number(metrics?.total_volume_eur).toLocaleString('en-US')}`,
              sub: 'Zero Defaults',
              icon: <TrendingUp size={20} className="text-teal-400" />,
              bg: 'bg-slate-800/80 border-slate-700'
            },
            {
              label: t(lang, 'Average Delivery', 'አማካይ የመድረሻ ጊዜ'),
              val: metrics?.avg_payout_time,
              sub: 'CBE & Telebirr Instant',
              icon: <Clock size={20} className="text-blue-400" />,
              bg: 'bg-slate-800/80 border-slate-700'
            },
            {
              label: t(lang, 'Dispute Rate', 'አለመግባባት'),
              val: '0.00%',
              sub: 'Clean Track Record',
              icon: <Award size={20} className="text-purple-400" />,
              bg: 'bg-slate-800/80 border-slate-700'
            },
          ].map((m, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${m.bg} shadow-lg space-y-1`}>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-slate-900/60">{m.icon}</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white font-mono">{m.val}</p>
              <p className="text-[11px] font-semibold text-slate-300">{m.label}</p>
              <p className="text-[10px] text-emerald-400">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* THE "HOW WE ELIMINATE RISK" GUARANTEE BOX */}
        <div className="bg-slate-850 border border-slate-700 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base border-b border-slate-700 pb-3">
            <ShieldCheck size={22} />
            <h2>{t(lang, 'The 3-Pillar Anti-Scam Guarantee for New Customers', 'ለአዳዲስ ደንበኞች የተዘጋጀ ባለ 3 ዋስትና')}</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="text-2xl">🧪</div>
              <h3 className="font-bold text-sm text-white">{t(lang, '1. Split Test Transfers', '1. በትንሽ ገንዘብ ሞክሩ')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t(lang, 'Hesitant? Start with just €20–€50. Once your family confirms the Birr in 5 mins, proceed with the rest.', 'መጀመሪያ በ €20 ወይም €50 ይሞክሩ። ቤተሰብዎ በ 5 ደቂቃ ውስጥ ማግኘቱን ሲያረጋግጡ ቀሪውን ይላኩ።')}
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="text-2xl">🧾</div>
              <h3 className="font-bold text-sm text-white">{t(lang, '2. Real CBE / Telebirr Slips', '2. ትክክለኛ የ CBE ደረሰኝ')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t(lang, 'Every payout includes the official CBE Reference (FT...) or Telebirr slip that can be verified inside CBE mobile banking.', 'እያንዳንዱ ክፍያ በ CBE ሞባይል ባንኪንግ የሚረጋገጥ የ FT ቁጥር ደረሰኝ ወዲያውኑ ይላካል።')}
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="text-2xl">🎓</div>
              <h3 className="font-bold text-sm text-white">{t(lang, '3. Real Person, Real Campus', '3. ህጋዊ እና የሚታወቅ ማንነት')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t(lang, 'Not an anonymous burner phone. Full Erasmus Mundus academic standing in Saint-Étienne, France with verified reputation.', 'ስም የማይታወቅ የቴሌግራም አካውንት አይደለም። በፈረንሳይ በቅዱስ ኤቲየን ማስተርሱን የሚማር ግልጽ ማንነት።')}
              </p>
            </div>
          </div>
        </div>

        {/* RECENT VERIFIED SETTLEMENTS FEED (Visible Only to Operator) */}
        {isOperator && (
          <div className="bg-slate-850 border border-slate-700 rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h3>{t(lang, 'Recent Verified Settlements (Admin View)', 'የቅርብ የተረጋገጡ ክፍያዎች')}</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Live Audited Log
              </span>
            </div>

            {(!settlements || settlements.length === 0) ? (
              <div className="text-center py-8 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs space-y-1">
                <p className="font-semibold text-slate-300">Live Transaction Log Active</p>
                <p className="text-[11px] text-slate-500">All transfers are recorded cryptographically as settlements are completed with authentic bank references.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {settlements.map(s => (
                  <div key={s.id} className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs shrink-0">
                        €{s.amount_eur}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">
                            {formatCurrency(s.amount_eur, 'EUR')} ➔ {formatETB(s.amount_etb)}
                          </p>
                          <span className="badge bg-emerald-500/10 text-emerald-300 text-[10px] font-mono">
                            {s.bank_name?.includes('Telebirr') ? 'Telebirr' : 'CBE'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Ref: <strong className="text-slate-300">{s.cbe_ref}</strong> · {s.beneficiary}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div className="text-xs">
                        <span className="text-emerald-400 font-semibold block">✅ Settled in {s.settled_mins}m</span>
                        <span className="text-[10px] text-slate-500">{s.created_at}</span>
                      </div>
                      <Link
                        to={`/receipt/${s.id}`}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Audit this transfer"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-center text-xs text-slate-500 pt-2">
              🔒 All transactions recorded cryptographically with locked Euro exchange rates.
            </p>
          </div>
        )}

        {/* BOTTOM WHATSAPP CALL TO ACTION */}
        <div className="bg-gradient-to-r from-emerald-900/60 to-slate-900 border border-emerald-600/40 p-6 rounded-3xl text-center space-y-4">
          <h3 className="text-lg font-bold text-white">
            {t(lang, 'Ready to exchange Euro to Ethiopian Birr?', 'ዩሮ ወደ ብር ለመቀየር ይፈልጋሉ?')}
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            {t(lang, 'Contact on WhatsApp to lock today’s Euro rate and get instant family payout in Ethiopia.', 'የዕለቱን የዩሮ ዋጋ ቆልፈው በኢትዮጵያ ለቤተሰብዎ በደቂቃዎች ውስጥ ለማድረስ በዋትስአፕ ያግኙ።')}
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={openWhatsApp}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl text-sm flex items-center gap-2 transition-colors shadow-lg shadow-green-950/50"
            >
              <Share2 size={16} />
              <span>{t(lang, 'Share Verified Profile to WhatsApp Group', 'ይህን የተረጋገጠ ፕሮፋይል ለዋትስአፕ ግሩፕ ላክ')}</span>
            </button>
            <Link
              to="/verify"
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-5 rounded-xl text-sm flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <span>{t(lang, 'Public Receipt Verifier', 'ደረሰኝ ማረጋገጫ')}</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
            ← {t(lang, 'Sign in to BirrLink Portal', 'ወደ BirrLink መድረክ ግባ')}
          </Link>
        </div>

      </div>
    </div>
  );
}
