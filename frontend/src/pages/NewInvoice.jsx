import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils';
import { Search, CheckCircle } from 'lucide-react';

export default function NewInvoice() {
  const { lang } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1); // 1: find retailer, 2: create invoice
  const [phone, setPhone] = useState('');
  const [retailer, setRetailer] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');
  const [form, setForm] = useState({ amount: '', description: '', due_date: '', currency: 'EUR' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [rates, setRates] = useState([]);

  // Fetch rates
  useState(() => {
    api.get('/rates').then(r => setRates(r.data)).catch(() => {});
  }, []);

  const findRetailer = async e => {
    e.preventDefault(); setSearchErr(''); setSearching(true);
    try {
      const r = await api.get(`/users/search?phone=${phone}`);
      setRetailer(r.data); setStep(2);
    } catch (e) {
      setSearchErr(e.response?.data?.error || 'Not found');
    } finally { setSearching(false); }
  };

  const currentRate = rates.find(r => r.currency === form.currency)?.rate_to_etb || (form.currency === 'EUR' ? 142.5 : 1);
  const amountInETB = form.currency === 'ETB' ? parseFloat(form.amount || 0) : parseFloat(form.amount || 0) * currentRate;

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      await api.post('/invoices', {
        retailer_phone: retailer.phone,
        amount: parseFloat(form.amount),
        currency: form.currency,
        fx_rate: currentRate,
        description: form.description,
        due_date: form.due_date,
      });
      nav('/invoices');
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to create invoice');
    } finally { setLoading(false); }
  };

  const scoreColor = s => s >= 75 ? 'text-green-700 bg-green-50' : s >= 50 ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50';

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t(lang,'Create New Invoice','አዲስ ደረሰኝ ፍጠር')}</h1>

      {/* Step indicators */}
      <div className="flex items-center gap-3">
        {[1,2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{step > s ? '✓' : s}</div>
            <span className={`text-sm ${step >= s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {s === 1 ? t(lang,'Find Retailer','ቸርቻሪ ፈልግ') : t(lang,'Invoice Details','የደረሰኝ ዝርዝር')}
            </span>
            {s < 2 && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Find retailer */}
      {step === 1 && (
        <div className="card">
          <h2 className="font-semibold mb-4">{t(lang,'Search Retailer by Phone','ቸርቻሪ በስልክ ቁጥር ፈልግ')}</h2>
          <form onSubmit={findRetailer} className="space-y-4">
            <div>
              <label className="label">{t(lang,'Retailer Phone Number','የቸርቻሪ ስልክ ቁጥር')}</label>
              <div className="flex gap-2">
                <input className="input" type="tel" placeholder="09XXXXXXXX"
                  value={phone} onChange={e => setPhone(e.target.value)} required />
                <button className="btn-primary flex items-center gap-1" disabled={searching}>
                  <Search size={16} /> {searching ? '...' : t(lang,'Find','ፈልግ')}
                </button>
              </div>
              {searchErr && <p className="text-red-600 text-sm mt-1">{searchErr}</p>}
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Retailer found + invoice form */}
      {step === 2 && retailer && (
        <>
          {/* Retailer card */}
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="font-semibold text-green-800">{t(lang,'Retailer Found','ቸርቻሪ ተገኘ')}</span>
                </div>
                <p className="font-bold text-lg text-gray-900">{retailer.name}</p>
                {retailer.business && <p className="text-sm text-gray-600">{retailer.business}</p>}
                <p className="text-sm text-gray-500">{retailer.phone} · {retailer.location}</p>
              </div>
              <div className={`px-3 py-2 rounded-xl text-center ${scoreColor(retailer.trust_score)}`}>
                <p className="text-2xl font-black">{retailer.trust_score?.toFixed(0)}</p>
                <p className="text-xs font-medium">{t(lang,'Trust Score','እምነት ውጤት')}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200 flex gap-4 text-sm">
              <span>{t(lang,'Credit limit','የብድር ገደብ')}: <strong className="text-green-700">ETB {retailer.credit_limit?.toLocaleString()}</strong></span>
              {retailer.verified ? <span className="text-green-700">✅ {t(lang,'Verified','ተረጋግጧል')}</span> : <span className="text-yellow-600">⚠️ {t(lang,'Unverified','ያልተረጋገጠ')}</span>}
            </div>
          </div>

          {/* Invoice form */}
          <div className="card">
            <h2 className="font-semibold mb-4">{t(lang,'Invoice Details','የደረሰኝ ዝርዝር')}</h2>
            {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{err}</div>}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">{t(lang,'Transaction Currency','የግብይት ምንዛሬ')}</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { code: 'EUR', label: '🇪🇺 Euro (€) — Diaspora / Europe', symbol: '€' },
                    { code: 'ETB', label: '🇪🇹 Ethiopian Birr (ETB)', symbol: 'ETB' },
                  ].map(c => (
                    <button
                      type="button"
                      key={c.code}
                      onClick={() => setForm({ ...form, currency: c.code })}
                      className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                        form.currency === c.code
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-500'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">
                    {t(lang, `Amount in ${form.currency}`, `የመጠን ልክ በ${form.currency}`)}
                  </label>
                  {form.currency !== 'ETB' && (
                    <span className="text-xs text-emerald-700 font-mono font-semibold">
                      1 {form.currency} = {currentRate.toFixed(2)} ETB
                    </span>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">
                    {form.currency === 'EUR' ? '€' : form.currency === 'USD' ? '$' : 'ETB'}
                  </span>
                  <input
                    className="input pl-12 text-lg font-semibold"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>

                {/* Show converted Birr equivalent if in foreign currency */}
                {form.currency !== 'ETB' && form.amount && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                    <span>{t(lang, 'Equivalent in Ethiopian Birr:', 'የኢትዮጵያ ብር አቻ ዋጋ:')}</span>
                    <strong className="font-mono text-sm font-black text-emerald-700">
                      ETB {amountInETB.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </div>
                )}

                {amountInETB > retailer.credit_limit && (
                  <p className="text-yellow-600 text-xs mt-1">
                    ⚠️ {t(lang,'Amount exceeds retailer credit limit','መጠኑ የቸርቻሪውን የብድር ገደብ ያልፋል')} (ETB {retailer.credit_limit?.toLocaleString()})
                  </p>
                )}
              </div>
              <div>
                <label className="label">{t(lang,'Description (optional)','መግለጫ (አማራጭ)')}</label>
                <textarea className="input resize-none" rows={2} placeholder={t(lang,'What goods/services?','ምን እቃዎች/አገልግሎቶች?')}
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label">{t(lang,'Due Date','የሚከፈልበት ቀን')}</label>
                <input className="input" type="date" value={form.due_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({ ...form, due_date: e.target.value })} required />
              </div>

              {/* Finance preview */}
              {form.amount && (
                <div className="bg-blue-50 rounded-lg p-4 text-sm space-y-1">
                  <p className="font-semibold text-blue-800">💡 {t(lang,'If you request financing:','ፋይናንስ ከጠየቁ:')}</p>
                  <p className="text-blue-700">
                    {t(lang,'You receive (80%):','ይቀበላሉ (80%):')}{' '}
                    <strong>
                      {form.currency === 'EUR' ? `€${(form.amount * 0.8).toLocaleString()} (~ETB ${(amountInETB * 0.8).toLocaleString()})` : `ETB ${(form.amount * 0.8).toLocaleString()}`}
                    </strong>
                  </p>
                  <p className="text-blue-700">
                    {t(lang,'Retailer repays (100%):','ቸርቻሪ ይከፍላል (100%):')}{' '}
                    <strong>
                      {form.currency === 'EUR' ? `€${Number(form.amount).toLocaleString()} (~ETB ${amountInETB.toLocaleString()})` : `ETB ${Number(form.amount).toLocaleString()}`}
                    </strong>
                  </p>
                  <p className="text-blue-700">
                    {t(lang,'Platform fee (3%):','የመድረክ ክፍያ (3%):')}{' '}
                    <strong>
                      {form.currency === 'EUR' ? `€${(form.amount * 0.03).toLocaleString()} (~ETB ${(amountInETB * 0.03).toLocaleString()})` : `ETB ${(form.amount * 0.03).toLocaleString()}`}
                    </strong>
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                  ← {t(lang,'Back','ወደ ኋላ')}
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? t(lang,'Creating...','እየፈጠረ...') : t(lang,'Create Invoice','ደረሰኝ ፍጠር')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
