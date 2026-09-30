import { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils';
import { X, Receipt, Check, Copy, ExternalLink, Share2, Sparkles, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BirrLinkIcon } from './BirrLinkLogo';

export default function DigitalReceiptModal({ isOpen, onClose, eurRate = 144.50, onReceiptCreated }) {
  const { lang } = useAuth();
  const [transferType, setTransferType] = useState('Standard');
  const [amountEur, setAmountEur] = useState('100');
  const [rate, setRate] = useState(eurRate.toString());
  const [bankName, setBankName] = useState('Commercial Bank of Ethiopia (CBE)');
  const [beneficiary, setBeneficiary] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [senderName, setSenderName] = useState('');
  const [cbeRef, setCbeRef] = useState('');
  const [settledMins, setSettledMins] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdReceipt, setCreatedReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentRate = parseFloat(rate) || eurRate;
  const computedEtb = (parseFloat(amountEur) || 0) * currentRate;

  const handleTypeChange = (type) => {
    setTransferType(type);
    if (type === 'Pilot Test' && (!amountEur || amountEur === '100')) {
      setAmountEur('20');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amountEur || !beneficiary || !cbeRef) {
      setError('Please fill in Amount (€), Beneficiary Name, and Bank Reference ID.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users/settlements', {
        amount_eur: parseFloat(amountEur),
        rate: currentRate,
        amount_etb: computedEtb,
        bank_name: bankName,
        beneficiary: beneficiary.trim(),
        account_number: accountNumber.trim(),
        sender_name: senderName.trim(),
        cbe_ref: cbeRef.trim(),
        settled_mins: parseInt(settledMins, 10) || 5,
        transfer_type: transferType,
      });
      setCreatedReceipt(res.data);
      if (onReceiptCreated) onReceiptCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate digital receipt.');
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppMessage = (rec) => {
    if (!rec) return '';
    const isPilot = rec.transfer_type === 'Pilot Test' || rec.transfer_type?.includes('Pilot');
    const receiptUrl = `${window.location.origin}/receipt/${rec.id}`;
    return (
      `🧾 *OFFICIAL BIRRLINK DIGITAL RECEIPT*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🛡️ *Status:* ✅ SETTLED & VERIFIED\n` +
      `📌 *Ref Code:* ${rec.id}\n` +
      (isPilot ? `🧪 *Type:* Small Pilot Test Transfer\n` : '') +
      `💶 *Euro Received:* €${Number(rec.amount_eur).toFixed(2)}\n` +
      `💱 *Locked Rate:* 1 EUR = ${Number(rec.rate).toFixed(2)} ETB\n` +
      `🇪🇹 *Birr Delivered:* ETB ${Number(rec.amount_etb).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `🏦 *Bank Rail:* ${rec.bank_name}\n` +
      `👤 *Beneficiary:* ${rec.beneficiary}\n` +
      `🔢 *Bank Ref / SMS Code:* ${rec.cbe_ref}\n` +
      `⏱️ *Settlement SLA:* Settled in ${rec.settled_mins || 5} mins\n` +
      `🎓 *Verified Operator:* Demelash Abiye Deguale (Mines Saint-Étienne, France)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔗 *Verify Live Online:* ${receiptUrl}`
    );
  };

  const copyWhatsApp = () => {
    if (!createdReceipt) return;
    navigator.clipboard.writeText(getWhatsAppMessage(createdReceipt));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetForm = () => {
    setCreatedReceipt(null);
    setBeneficiary('');
    setAccountNumber('');
    setCbeRef('');
    setSenderName('');
    setAmountEur('100');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/40 text-slate-100 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-5 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BirrLinkIcon size={38} className="shadow-md shrink-0" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t(lang, 'Generate Official Digital Receipt', 'ህጋዊ የዲጂታል ደረሰኝ ማመንጫ')}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold font-mono">
                  EUR ⇄ ETB
                </span>
              </h2>
              <p className="text-xs text-emerald-300">
                {t(lang, 'Instant verifiable receipt link to share on WhatsApp', 'በዋትስአፕ ለደንበኛ የሚላክ የማይበረዝ ህጋዊ ማረጋገጫ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {createdReceipt ? (
            /* Success View */
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                  {createdReceipt.id}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">
                  {t(lang, 'Digital Receipt Generated & Secured!', 'ደረሰኙ በተሳካ ሁኔታ ተፈጥሯል!')}
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
                  Settled ETB {Number(createdReceipt.amount_etb).toLocaleString('en-US', { minimumFractionDigits: 2 })} for {createdReceipt.beneficiary}. Bank Ref: <span className="font-mono text-emerald-400 font-bold">{createdReceipt.cbe_ref}</span>.
                </p>
              </div>

              {/* Receipt URL Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-left">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Public Verification Link:
                </p>
                <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700 font-mono text-xs text-emerald-300 break-all">
                  <span>{window.location.origin}/receipt/{createdReceipt.id}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={copyWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied WhatsApp Message!' : 'Copy WhatsApp Message & Link'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`/receipt/${createdReceipt.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <ExternalLink size={14} />
                    <span>View Receipt Page</span>
                  </a>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold py-2 px-3 rounded-xl text-xs transition-colors border border-slate-700"
                  >
                    + Create Another
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200">
                  {error}
                </div>
              )}

              {/* Transfer Type Select */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  Transfer Category:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('Standard')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      transferType === 'Standard'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>⚡ Standard Settlement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange('Pilot Test')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      transferType === 'Pilot Test'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>🧪 Small Pilot Test</span>
                  </button>
                </div>
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Euro (€):</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={amountEur}
                    onChange={(e) => setAmountEur(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Rate (ETB):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-emerald-400 font-semibold block mb-1">Birr Output:</label>
                  <div className="w-full bg-slate-950/80 border border-emerald-500/40 rounded-xl px-3 py-2 font-mono font-bold text-emerald-400 truncate">
                    {computedEtb.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                  </div>
                </div>
              </div>

              {/* Bank Rail */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Receiving Bank Rail:</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="Telebirr SuperApp">Telebirr SuperApp</option>
                  <option value="Awash Bank">Awash Bank</option>
                  <option value="Bank of Abyssinia (BOA)">Bank of Abyssinia (BOA)</option>
                  <option value="Dashen Bank">Dashen Bank</option>
                </select>
              </div>

              {/* Beneficiary and Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Beneficiary Name (Ethiopia):</label>
                  <input
                    type="text"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    placeholder="e.g. Alemayehu Tadesse"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Account # or Phone (optional):</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 100018392019"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* CBE Reference & Minutes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="text-emerald-300 font-semibold block mb-1">
                    Official Bank Reference ID / SMS Code:
                  </label>
                  <input
                    type="text"
                    value={cbeRef}
                    onChange={(e) => setCbeRef(e.target.value)}
                    placeholder="e.g. FT2627409218 or TLB-849102"
                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Settled Mins:</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settledMins}
                    onChange={(e) => setSettledMins(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Sender Name */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Sender Name in Europe (optional):</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Yared T. (Frankfurt)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <ShieldCheck size={16} />
                  <span>{loading ? 'Creating Digital Slip...' : 'Generate Official Digital Receipt Link'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
