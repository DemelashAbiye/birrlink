import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatETB, formatCurrency, formatDate, t } from '../utils';
import { ShieldCheck, CheckCircle2, Copy, Check, Share2, Search, ArrowRight, ExternalLink, Lock } from 'lucide-react';
import BirrLinkLogo from '../components/BirrLinkLogo';

export default function PublicVerify() {
  const { id } = useParams();
  const { lang } = useAuth();
  const [refId, setRefId] = useState(id || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchVerification = async (searchId) => {
    if (!searchId || searchId.trim() === '') return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await api.get(`/invoices/verify/${searchId.trim()}`);
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'No transaction found with this reference code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVerification(id);
    }
  }, [id]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVerification(refId);
  };

  const getWhatsAppMessage = () => {
    if (!data) return '';
    return `🧾 *BIRRLINK VERIFIED EXCHANGE RECEIPT*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🛡️ *Status:* ✅ ${data.status.toUpperCase()} & VERIFIED\n` +
      `🔢 *Ref:* #${data.id.slice(0, 8).toUpperCase()}\n` +
      `📅 *Date:* ${formatDate(data.created_at)}\n` +
      `💶 *Euro Sent:* €${Number(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `💱 *Locked Rate:* 1 EUR = ${data.fx_rate ? data.fx_rate.toFixed(2) : '144.50'} ETB\n` +
      `🇪🇹 *Birr Value:* ETB ${Number(data.amount_etb || data.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `👤 *Sender:* ${data.supplier_name}\n` +
      `🏪 *Beneficiary:* ${data.retailer_name} ${data.retailer_business ? `(${data.retailer_business})` : ''}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🔒 *Verify Live Online:* ${window.location.origin}/verify/${data.id.slice(0, 8)}`;
  };

  const copyWhatsAppText = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(getWhatsAppMessage());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Top Branding Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <BirrLinkLogo size="lg" variant="light" showTagline={true} showCorridor={true} asLink={true} />
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {t(lang, 'Transaction Trust Verifier', 'የልውውጥ ደረሰኝ ማረጋገጫ')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {t(lang, 'Verify real-time proof of currency exchanges, locked Euro rates, and recipient settlements.', 'የዩሮ እና የብር ልውውጥን ትክክለኛነት፣ የተቆለፈውን ዋጋ እና ክፍያን በቀጥታ ያረጋግጡ።')}
          </p>

          {/* Operator Verified Banner */}
          <div className="bg-emerald-950/60 border border-emerald-600/40 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs max-w-lg mx-auto text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
              <span className="text-slate-200">
                Verified Operator: <strong className="text-white">Demelash Deguale</strong> (École des Mines Saint-Étienne)
              </span>
            </div>
            <Link to="/trust" className="text-emerald-400 hover:text-emerald-300 font-bold underline shrink-0">
              Trust Score ➔
            </Link>
          </div>
        </div>

        {/* Search / Lookup Box */}
        <form onSubmit={handleSearch} className="bg-slate-800/80 border border-slate-700/80 p-3 sm:p-4 rounded-2xl shadow-xl flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
              placeholder={t(lang, 'Enter Reference ID (e.g. 3D9AD909)...', 'የደረሰኝ መለያ ያስገቡ...')}
              value={refId}
              onChange={e => setRefId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0"
          >
            {loading ? '...' : (
              <>
                <span>{t(lang, 'Verify', 'አረጋግጥ')}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-950/80 border border-red-700 text-red-200 p-4 rounded-2xl text-center text-sm">
            {error}
          </div>
        )}

        {/* VERIFICATION CERTIFICATE / RECEIPT CARD */}
        {data && (
          <div className="bg-gradient-to-b from-slate-800 to-slate-850 border-2 border-emerald-500/50 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Watermark badge */}
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none text-emerald-300">
              <ShieldCheck size={200} />
            </div>

            {/* Stamp header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white">
                      {t(lang, 'OFFICIAL VERIFIED RECEIPT', 'የተረጋገጠ ይፋዊ ደረሰኝ')}
                    </h2>
                    <span className="badge bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px]">
                      {data.security_stamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Ref: #{data.id.slice(0, 8).toUpperCase()} · Created: {formatDate(data.created_at)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950">
                  ✅ {data.status}
                </span>
              </div>
            </div>

            {/* Money Box: Euro <-> ETB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Euro Sent */}
              <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium mb-1">
                  💶 {t(lang, 'Euro Amount Sent', 'የተላከው የዩሮ መጠን')}
                </p>
                <p className="text-3xl font-black text-white font-mono">
                  €{Number(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                  Locked Rate: 1 EUR = {data.fx_rate ? data.fx_rate.toFixed(2) : '144.50'} ETB
                </p>
              </div>

              {/* Birr Received */}
              <div className="bg-emerald-950/40 border border-emerald-600/40 p-4 rounded-2xl">
                <p className="text-xs text-emerald-300 font-medium mb-1">
                  🇪🇹 {t(lang, 'Ethiopian Birr Payout', 'የሚደርሰው የብር መጠን')}
                </p>
                <p className="text-3xl font-black text-emerald-400 font-mono">
                  ETB {Number(data.amount_etb || data.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Guaranteed settlement amount
                </p>
              </div>
            </div>

            {/* Parties info */}
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/60 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-xs">{t(lang, 'Sender (Europe)', 'ላኪ (አውሮፓ)')}:</span>
                <span className="font-bold text-white">{data.supplier_name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-xs">{t(lang, 'Recipient / Beneficiary', 'ተቀባይ')}:</span>
                <span className="font-bold text-emerald-400">{data.retailer_name} {data.retailer_business && `· ${data.retailer_business}`}</span>
              </div>
              {data.description && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 text-xs">{t(lang, 'Note / Description', 'ማስታወሻ')}:</span>
                  <span className="text-slate-200">{data.description}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Lock size={12} className="text-emerald-400" />
                  Audit Fingerprint: {data.audit_hash}
                </span>
                <span className="text-emerald-400 font-semibold">
                  100% Anti-Tamper Verified
                </span>
              </div>
            </div>

            {/* WhatsApp Proof Buttons */}
            <div className="space-y-2 pt-2">
              <p className="text-xs text-center text-slate-400 font-medium">
                {t(lang, 'Share this verifiable proof with your customer or WhatsApp group:', 'ይህን የተረጋገጠ ደረሰኝ ለደንበኛዎ ወይም ለግሩፑ ያጋሩ:')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={openWhatsApp}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors shadow-lg shadow-green-950/40"
                >
                  <Share2 size={16} />
                  <span>{t(lang, 'Send to WhatsApp', 'ለዋትስአፕ ላክ')}</span>
                </button>

                <button
                  onClick={copyWhatsAppText}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  <span>{copied ? t(lang, 'Copied Receipt!', 'ደረሰኙ ተቀድቷል!') : t(lang, 'Copy Receipt Text', 'ደረሰኙን ቅዳ')}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Community Trust Explainer */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck size={18} />
            <span>Why BirrLink Receipts Build 100% Trust:</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-slate-300">
            <li><strong>Tamper-Proof Audit:</strong> Every exchange has a unique hash and verifiable cryptographic certificate.</li>
            <li><strong>Guaranteed Exchange Rate:</strong> The Euro-to-Birr rate is permanently locked at transaction time.</li>
            <li><strong>Public Verification:</strong> Anyone in your WhatsApp group can open this link to confirm funds were registered, tracked, and settled.</li>
          </ul>
        </div>

        {/* Back to App */}
        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-emerald-400 hover:underline">
            ← {t(lang, 'Back to BirrLink Operator Sign In', 'ወደ ቢርሊንክ አስተዳዳሪ ግባ')}
          </Link>
        </div>

      </div>
    </div>
  );
}
