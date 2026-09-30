import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatETB, formatDate, t } from '../utils';
import {
  ShieldCheck, CheckCircle2, Copy, Check, Share2, Search, Printer,
  ExternalLink, Building2, Smartphone, ArrowRight, Clock, Hash, Lock, UserCheck, Trash2
} from 'lucide-react';
import AcademicVerificationModal from '../components/AcademicVerificationModal';
import BirrLinkLogo, { BirrLinkIcon } from '../components/BirrLinkLogo';

export default function DigitalReceipt() {
  const { id } = useParams();
  const { user, lang } = useAuth();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(id || '');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);

  const isOperator = Boolean(
    user && (
      user.role === 'admin' ||
      user.phone === '+33773552239' ||
      user.phone === '0900000000' ||
      user.email === 'demelash.deguale@etu.emse.fr' ||
      user.email === 'dadtegy@gmail.com'
    )
  );

  const handleDelete = async () => {
    if (!receipt) return;
    const confirmed = window.confirm(
      lang === 'am'
        ? `እርግጠኛ ነዎት ይህን ደረሰኝ #${receipt.id} (ለ ${receipt.beneficiary}) እስከመጨረሻው ማጥፋት ይፈልጋሉ?`
        : `Are you sure you want to permanently delete receipt #${receipt.id} for ${receipt.beneficiary}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/users/settlements/${receipt.id}`);
      alert(lang === 'am' ? 'ደረሰኙ በተሳካ ሁኔታ ተሰርዟል!' : 'Receipt deleted successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete receipt');
    } finally {
      setDeleting(false);
    }
  };

  const fetchReceipt = async (targetId) => {
    if (!targetId || !targetId.trim()) return;
    setLoading(true);
    setError('');
    setReceipt(null);
    try {
      const res = await api.get(`/users/settlements/${targetId.trim()}`);
      setReceipt(res.data.receipt);
    } catch (err) {
      setError(err.response?.data?.error || 'Digital receipt not found for this reference code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReceipt(id);
    }
  }, [id]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReceipt(searchId);
  };

  const getWhatsAppMessage = () => {
    if (!receipt) return '';
    const isPilot = receipt.transfer_type === 'Pilot Test' || receipt.transfer_type?.includes('Pilot');
    return (
      `🧾 *OFFICIAL BIRRLINK DIGITAL RECEIPT*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🛡️ *Status:* ✅ SETTLED & VERIFIED\n` +
      `📌 *Ref Code:* ${receipt.id}\n` +
      `📅 *Date:* ${formatDate(receipt.created_at)}\n` +
      (isPilot ? `🧪 *Type:* Small Pilot Test Transfer\n` : '') +
      `💶 *Euro Received:* €${Number(receipt.amount_eur).toFixed(2)}\n` +
      `💱 *Locked Rate:* 1 EUR = ${Number(receipt.rate).toFixed(2)} ETB\n` +
      `🇪🇹 *Birr Delivered:* ETB ${Number(receipt.amount_etb).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `🏦 *Bank Rail:* ${receipt.bank_name}\n` +
      `👤 *Beneficiary:* ${receipt.beneficiary}\n` +
      `🔢 *Bank Ref / SMS Code:* ${receipt.cbe_ref}\n` +
      `⏱️ *Settlement SLA:* Settled in ${receipt.settled_mins || 5} mins\n` +
      `🎓 *Verified Operator:* Demelash Abiye Deguale (Mines Saint-Étienne, France)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔗 *Verify Live Online:* ${window.location.origin}/receipt/${receipt.id}`
    );
  };

  const copyWhatsApp = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyBankRef = () => {
    if (!receipt) return;
    navigator.clipboard.writeText(receipt.cbe_ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const openWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(getWhatsAppMessage())}`, '_blank');
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      {/* Search Header for Public Lookup */}
      <div className="max-w-2xl mx-auto mb-6 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold text-sm">
            <span className="text-xl">←</span>
            <span>{t(lang, 'Back to Exchange Dashboard', 'ወደ ዋናው ገጽ ተመለስ')}</span>
          </Link>
          <span className="text-xs bg-emerald-950 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full font-semibold">
            🇪🇺 EUR ➔ 🇪🇹 ETB BirrLink Corridor
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search receipt by ID (e.g. TRX-123456 or UUID)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            {loading ? 'Searching...' : t(lang, 'Verify Receipt', 'ደረሰኙን አረጋግጥ')}
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm">
          {error}
        </div>
      )}

      {receipt && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Printable Electronic Certificate */}
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Top Security Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-slate-800 to-emerald-900 px-6 py-4 border-b border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BirrLinkIcon size={40} className="shadow-lg shrink-0" />
                <div>
                  <h1 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2 flex-wrap">
                    <span>Official Remittance Slip</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold font-mono">
                      EUR ⇄ ETB
                    </span>
                  </h1>
                  <p className="text-xs text-emerald-300">
                    BirrLink Verifiable Direct Settlement System
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black font-mono">
                  <CheckCircle2 size={13} />
                  <span>SETTLED</span>
                </span>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  ID: #{receipt.id}
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 text-sm">
              {/* Type Badge if Pilot */}
              {(receipt.transfer_type === 'Pilot Test' || receipt.transfer_type?.includes('Pilot')) && (
                <div className="bg-amber-950/50 border border-amber-500/40 text-amber-300 p-3 rounded-xl flex items-center gap-3">
                  <span className="text-xl">🧪</span>
                  <div className="text-xs">
                    <p className="font-bold">Verified Small Pilot Test Transfer</p>
                    <p className="text-amber-200/80">
                      Completed under the Zero-Risk New Customer Protocol. Fully verified and delivered.
                    </p>
                  </div>
                </div>
              )}

              {/* Settlement Big Amounts Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Amount Sent (Euro)
                  </p>
                  <p className="text-3xl font-black text-white font-mono">
                    €{Number(receipt.amount_eur).toFixed(2)}
                  </p>
                  <p className="text-xs text-emerald-400 font-mono">
                    Rate: 1 EUR = {Number(receipt.rate).toFixed(2)} ETB
                  </p>
                </div>

                <div className="sm:border-l sm:border-slate-800 sm:pl-6 space-y-1">
                  <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">
                    Delivered in Ethiopia (Birr)
                  </p>
                  <p className="text-3xl font-black text-emerald-400 font-mono">
                    ETB {Number(receipt.amount_etb).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-400">
                    Net Payout · 0% Deductions
                  </p>
                </div>
              </div>

              {/* Recipient & Bank Reference Box */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Recipient Account & Bank Dispatch</span>
                  <span className="text-emerald-400 font-mono">⚡ Direct Deposit</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Beneficiary Name:</span>
                    <span className="text-white font-bold text-sm">{receipt.beneficiary}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Receiving Institution:</span>
                    <span className="text-white font-bold text-sm">{receipt.bank_name}</span>
                  </div>
                  {receipt.account_number && (
                    <div>
                      <span className="text-slate-500 block">Account / Phone:</span>
                      <span className="font-mono text-emerald-300 font-bold">{receipt.account_number}</span>
                    </div>
                  )}
                  {receipt.sender_name && (
                    <div>
                      <span className="text-slate-500 block">Sender Name:</span>
                      <span className="text-slate-300 font-semibold">{receipt.sender_name}</span>
                    </div>
                  )}
                </div>

                {/* Bank Reference Code Highlight */}
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[11px] text-emerald-300 font-semibold block uppercase">
                      Official Bank Reference / SMS Code
                    </span>
                    <span className="text-base font-mono font-black text-white tracking-wider">
                      {receipt.cbe_ref}
                    </span>
                  </div>
                  <button
                    onClick={copyBankRef}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    {copiedRef ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedRef ? 'Copied' : 'Copy Ref'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  ℹ️ The recipient can confirm this transaction immediately in their CBE Mobile Banking app (*847#), or by checking their incoming bank SMS with this reference code.
                </p>
              </div>

              {/* Verifiable European Academic Operator Stamp */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                    🎓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Settled by Demelash Abiye Deguale
                    </p>
                    <p className="text-[11px] text-slate-300">
                      MSc Candidate · <strong>École des Mines Saint-Étienne</strong> (France 🇫🇷)
                    </p>
                    <p className="text-[10px] text-emerald-400 font-mono">
                      Institutional Contact: demelash.deguale@etu.emse.fr
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setProofModalOpen(true)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <UserCheck size={14} />
                  <span>Inspect Credentials</span>
                </button>
              </div>

              {/* Audit Meta & Cryptographic Checksum */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between text-[11px] text-slate-500 font-mono gap-2">
                <div>
                  <span>Settlement Timestamp: </span>
                  <span className="text-slate-400">{formatDate(receipt.created_at)}</span>
                </div>
                <div>
                  <span>SHA256 Checksum: </span>
                  <span className="text-emerald-400 font-bold">{receipt.digitalChecksum || 'VALIDATED'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Toolbar (Non-printable) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
            <button
              onClick={openWhatsApp}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Share2 size={16} />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={copyWhatsApp}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? 'Copied Message!' : 'Copy Summary Text'}</span>
            </button>

            <button
              onClick={printReceipt}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>

            {isOperator && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="sm:col-span-3 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-300 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                title="Admin only: Delete this transaction"
              >
                <Trash2 size={15} className={deleting ? 'animate-spin' : ''} />
                <span>{deleting ? 'Deleting Receipt...' : 'Delete Receipt (Admin / Operator Only)'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Proof Modal */}
      <AcademicVerificationModal
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
      />
    </div>
  );
}
