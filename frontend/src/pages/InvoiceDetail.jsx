import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatETB, formatCurrency, formatDate, StatusBadge, ScoreBadge, t } from '../utils';
import { ArrowLeft, CheckCircle, DollarSign, Clock, User, Building, Phone, MapPin, Calendar, Share2, ShieldCheck, Copy, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InvoiceDetail() {
  const { id } = useParams();
  const { user, lang } = useAuth();
  const nav = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/invoices/${id}`);
      setInvoice(data);
      if (user.role === 'admin' || user.role === 'supplier') {
        const s = await api.get(`/users/me/score?userId=${data.retailer_id}`);
        setScore(s.data);
      }
    } catch { nav('/invoices'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const action = async (fn, confirmMsg) => {
    if (!window.confirm(confirmMsg)) return;
    setActionLoading(true);
    try { await fn(); await load(); }
    catch (e) { alert(e.response?.data?.error || 'Action failed'); }
    finally { setActionLoading(false); }
  };

  const getWhatsAppMessage = () => {
    if (!invoice) return '';
    return `🧾 *TRADELINK VERIFIED EXCHANGE RECEIPT*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🛡️ *Status:* ✅ ${invoice.status.toUpperCase()} & VERIFIED\n` +
      `🔢 *Ref:* #${invoice.id.slice(0, 8).toUpperCase()}\n` +
      `📅 *Date:* ${formatDate(invoice.created_at)}\n` +
      `💶 *Euro Amount:* €${Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `💱 *Locked Rate:* 1 EUR = ${invoice.fx_rate ? invoice.fx_rate.toFixed(2) : '144.50'} ETB\n` +
      `🇪🇹 *Birr Value:* ETB ${Number(invoice.amount_etb || (invoice.amount * (invoice.fx_rate || 1))).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `👤 *Sender:* ${invoice.supplier_name}\n` +
      `🏪 *Beneficiary:* ${invoice.retailer_name}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🔒 *Verify Live Online:* ${window.location.origin}/verify/${invoice.id.slice(0, 8)}`;
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

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;
  if (!invoice) return null;

  const timeline = [
    { label: t(lang, 'Invoice Created', 'ደረሰኝ ተፈጠረ'), date: invoice.created_at, done: true, icon: '📄' },
    { label: t(lang, 'Retailer Confirmed', 'ቸርቻሪ አረጋገጠ'), date: invoice.status !== 'pending' ? invoice.created_at : null, done: invoice.status !== 'pending', icon: '✅' },
    { label: t(lang, 'Finance Requested', 'ፋይናንስ ተጠየቀ'), date: null, done: ['financing_requested','financed','repaid'].includes(invoice.status), icon: '💰' },
    { label: t(lang, 'Finance Approved', 'ፋይናንስ ተቀበለ'), date: invoice.financed_at, done: ['financed','repaid'].includes(invoice.status), icon: '🏦' },
    { label: t(lang, 'Repaid', 'ተከፍሏል'), date: invoice.repaid_at, done: invoice.status === 'repaid', icon: '🎉' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => nav(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {t(lang, 'Invoice', 'ደረሰኝ')} <span className="font-mono text-gray-500">#{invoice.id.slice(0, 8)}</span>
          </h1>
          <p className="text-sm text-gray-500">{t(lang, 'Created', 'ተፈጠረ')} {formatDate(invoice.created_at)}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={invoice.status} lang={lang} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">

          {/* Amount card */}
          <div className="card bg-gradient-to-r from-green-700 to-green-800 text-white">
            <p className="text-green-200 text-sm mb-1">{t(lang, 'Invoice Amount', 'የደረሰኝ መጠን')}</p>
            <p className="text-4xl font-black">
              {formatCurrency(invoice.amount, invoice.currency || 'ETB')}
            </p>
            {invoice.currency && invoice.currency !== 'ETB' && invoice.amount_etb && (
              <p className="text-sm font-mono text-green-200 mt-1">
                ≈ {formatETB(invoice.amount_etb)}
                {invoice.fx_rate && (
                  <span className="text-xs opacity-80 ml-2">
                    (1 {invoice.currency} = {invoice.fx_rate.toFixed(2)} ETB)
                  </span>
                )}
              </p>
            )}
            {invoice.advance_amount && (
              <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-200">{t(lang, 'Advance (80%)', 'ቅድሚያ (80%)')}</p>
                  <p className="font-bold text-lg">{formatCurrency(invoice.advance_amount, invoice.currency || 'ETB')}</p>
                  {invoice.currency && invoice.currency !== 'ETB' && (
                    <p className="text-xs text-green-200 font-mono">
                      ≈ {formatETB(invoice.advance_amount * (invoice.fx_rate || 1))}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-green-200">{t(lang, 'Platform Fee (3%)', 'የመድረክ ክፍያ (3%)')}</p>
                  <p className="font-bold text-lg">{formatCurrency(invoice.amount * 0.03, invoice.currency || 'ETB')}</p>
                  {invoice.currency && invoice.currency !== 'ETB' && (
                    <p className="text-xs text-green-200 font-mono">
                      ≈ {formatETB((invoice.amount * 0.03) * (invoice.fx_rate || 1))}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Parties */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">{t(lang, 'Parties', 'ወገኖች')}</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Supplier */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  🏭 {t(lang, 'Supplier', 'አቅራቢ')}
                </p>
                <p className="font-bold text-gray-900">{invoice.supplier_name}</p>
                {invoice.supplier_business && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Building size={13} /> {invoice.supplier_business}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone size={13} /> {invoice.supplier_phone}
                </div>
              </div>
              {/* Retailer */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  🏪 {t(lang, 'Retailer', 'ቸርቻሪ')}
                </p>
                <p className="font-bold text-gray-900">{invoice.retailer_name}</p>
                {invoice.retailer_business && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Building size={13} /> {invoice.retailer_business}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone size={13} /> {invoice.retailer_phone}
                </div>
                {score && (
                  <div className="mt-2">
                    <ScoreBadge score={score.computed} />
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t(lang,'Credit limit','የብድር ገደብ')}: {formatETB(score.credit_limit)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description + dates */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">{t(lang, 'Details', 'ዝርዝሮች')}</h2>
            <div className="space-y-3 text-sm">
              {invoice.description && (
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
                  <p className="text-xs text-gray-400 mb-1">{t(lang,'Description','መግለጫ')}</p>
                  {invoice.description}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Calendar size={14}/>, label: t(lang,'Created','ተፈጠረ'), value: formatDate(invoice.created_at) },
                  { icon: <Clock size={14}/>, label: t(lang,'Due Date','የሚከፈልበት ቀን'), value: formatDate(invoice.due_date), urgent: invoice.status === 'financed' && new Date(invoice.due_date) < new Date() },
                  invoice.financed_at && { icon: <DollarSign size={14}/>, label: t(lang,'Financed On','የፋይናንስ ቀን'), value: formatDate(invoice.financed_at) },
                  invoice.repaid_at && { icon: <CheckCircle size={14}/>, label: t(lang,'Repaid On','የክፍያ ቀን'), value: formatDate(invoice.repaid_at) },
                ].filter(Boolean).map((d, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${d.urgent ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
                    {d.icon}
                    <div>
                      <p className="text-xs opacity-70">{d.label}</p>
                      <p className="font-semibold text-sm">{d.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: timeline + actions */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">{t(lang, 'Timeline', 'ጊዜ መስመር')}</h2>
            <ol className="relative border-l border-gray-200 ml-3 space-y-5">
              {timeline.map((step, i) => (
                <li key={i} className="ml-5">
                  <span className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full text-base border-2 ${
                    step.done ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white'
                  }`}>
                    {step.done ? step.icon : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                  </span>
                  <p className={`text-sm font-medium ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                  {step.date && <p className="text-xs text-gray-400">{formatDate(step.date)}</p>}
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-800">{t(lang, 'Actions', 'እርምጃዎች')}</h2>
            {user.role === 'retailer' && invoice.status === 'pending' && (
              <button disabled={actionLoading} onClick={() =>
                action(() => api.patch(`/invoices/${id}/confirm`), 'Confirm you received the goods?')
              } className="btn-primary w-full flex items-center justify-center gap-2">
                <CheckCircle size={16} /> {t(lang,'Confirm Receipt','ደርሷል ያረጋግጡ')}
              </button>
            )}
            {user.role === 'supplier' && invoice.status === 'confirmed' && (
              <button disabled={actionLoading} onClick={() =>
                action(() => api.post(`/invoices/${id}/request-finance`), 'Request 80% advance financing for this invoice?')
              } className="btn-primary w-full flex items-center justify-center gap-2">
                <DollarSign size={16} /> {t(lang,'Request Finance (80%)','ፋይናንስ ይጠይቁ (80%)')}
              </button>
            )}
            {user.role === 'admin' && invoice.status === 'financing_requested' && (
              <button disabled={actionLoading} onClick={() =>
                action(() => api.post(`/invoices/${id}/approve-finance`), 'Approve this financing request?')
              } className="btn-primary w-full flex items-center justify-center gap-2">
                ✅ {t(lang,'Approve Finance','ፋይናንስ ይቀበሉ')}
              </button>
            )}
            {user.role === 'retailer' && invoice.status === 'financed' && (
              <button disabled={actionLoading} onClick={() =>
                action(() => api.post(`/invoices/${id}/repay`), 'Mark this invoice as repaid?')
              } className="btn-primary w-full flex items-center justify-center gap-2">
                💳 {t(lang,'Repay Invoice','ደረሰኝ ይክፈሉ')}
              </button>
            )}
            {['pending','confirmed','financing_requested','financed','repaid'].includes(invoice.status) && (
              <p className="text-xs text-center text-gray-400">
                {t(lang,'Invoice ID','የደረሰኝ መለያ')}: <span className="font-mono">{invoice.id}</span>
              </p>
            )}
          </div>

          {/* WhatsApp Trust & Verification Proof Card */}
          <div className="card bg-emerald-950 text-white border border-emerald-800/80 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-emerald-800/60 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t(lang, 'Customer Trust & WhatsApp Proof', 'የደንበኛ እምነትና የዋትስአፕ ማረጋገጫ')}
                </h3>
                <p className="text-[10px] text-emerald-300/80">
                  {t(lang, 'Official tamper-proof exchange receipt', 'የማይቀየር ይፋዊ የልውውጥ ደረሰኝ')}
                </p>
              </div>
            </div>

            <p className="text-xs text-emerald-200/90 leading-relaxed">
              {t(
                lang,
                'Share this receipt into your WhatsApp group so your customer can independently verify the locked Euro rate and settlement.',
                'ደንበኛዎ የተቆለፈውን የዩሮ ዋጋና ክፍያውን በቀጥታ እንዲያረጋግጡ ደረሰኙን ለዋትስአፕ ግሩፕዎ ያጋሩ።'
              )}
            </p>

            <div className="space-y-2">
              <button
                onClick={openWhatsApp}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors shadow-md"
              >
                <Share2 size={14} />
                <span>{t(lang, 'Send Receipt to WhatsApp', 'ደረሰኙን በዋትስአፕ ላክ')}</span>
              </button>

              <button
                onClick={copyWhatsAppText}
                className="w-full bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors border border-emerald-700/50"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? t(lang, 'Copied to Clipboard!', 'ደረሰኙ ተቀድቷል!') : t(lang, 'Copy Receipt Text', 'ደረሰኙን ቅዳ')}</span>
              </button>

              <Link
                to={`/verify/${invoice.id.slice(0, 8)}`}
                target="_blank"
                className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 py-1.5 text-center transition-colors underline"
              >
                <span>{t(lang, 'Open Public Verification Certificate', 'ይፋዊውን የማረጋገጫ ገጽ ክፈት')}</span>
                <ExternalLink size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
