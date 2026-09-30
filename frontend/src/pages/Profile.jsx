import { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils';
import { User, Phone, MapPin, Building, Mail, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, lang, toggleLang } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    business: user?.business || '',
    location: user?.location || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const save = async e => {
    e.preventDefault(); setSaving(true); setErr(''); setSaved(false);
    try {
      await api.patch('/users/profile', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setErr(e.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const doLogout = () => { logout(); nav('/login'); };

  const roleColor = { supplier: 'from-blue-500 to-blue-700', retailer: 'from-purple-500 to-purple-700', admin: 'from-green-700 to-green-900' };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t(lang,'My Profile','የእኔ መገለጫ')}</h1>

      {/* Avatar card */}
      <div className={`card bg-gradient-to-r ${roleColor[user?.role]} text-white text-center`}>
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-black mx-auto mb-3">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <p className="text-xl font-bold">{user?.name}</p>
        <p className="text-white/70 capitalize">{user?.role} · {user?.business || 'TradeLink'}</p>
        <p className="text-white/60 text-sm mt-1">📞 {user?.phone}</p>
      </div>

      {/* Edit form */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">{t(lang,'Edit Information','መረጃ ያስተካክሉ')}</h2>

        {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{err}</div>}
        {saved && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">✅ {t(lang,'Profile saved!','መገለጫ ተቀምጧል!')}</div>}

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label flex items-center gap-1.5"><User size={14}/> {t(lang,'Full Name','ሙሉ ስም')}</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Building size={14}/> {t(lang,'Business Name','የንግድ ስም')}</label>
            <input className="input" value={form.business} onChange={set('business')} placeholder={t(lang,'Your business name','የንግድ ስምዎ')} />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><MapPin size={14}/> {t(lang,'Location','ቦታ')}</label>
            <input className="input" value={form.location} onChange={set('location')} placeholder="e.g. Addis Ababa, Washington DC..." />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Mail size={14}/> {t(lang,'Email','ኢሜይል')}</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" />
          </div>

          <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={saving}>
            <Save size={16} />
            {saving ? t(lang,'Saving...','እየቀመጠ...') : t(lang,'Save Changes','ለውጦችን ያቀምጡ')}
          </button>
        </form>
      </div>

      {/* Settings */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-800">{t(lang,'Settings','ቅንጅቶች')}</h2>
        <div className="flex items-center justify-between py-2 border-b">
          <div>
            <p className="text-sm font-medium text-gray-700">{t(lang,'Language','ቋንቋ')}</p>
            <p className="text-xs text-gray-400">
              {lang === 'en' ? 'Currently: English' : 'አሁን: አማርኛ'}
            </p>
          </div>
          <button onClick={toggleLang} className="btn-secondary text-sm flex items-center gap-1.5">
            🌐 {lang === 'en' ? 'Switch to አማርኛ' : 'Switch to English'}
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700">{t(lang,'Account','መለያ')}</p>
            <p className="text-xs text-gray-400">{t(lang,'Sign out of TradeLink','ከ TradeLink ይውጡ')}</p>
          </div>
          <button onClick={doLogout} className="btn-danger text-sm flex items-center gap-1.5">
            <LogOut size={15} /> {t(lang,'Sign Out','ውጣ')}
          </button>
        </div>
      </div>
    </div>
  );
}
