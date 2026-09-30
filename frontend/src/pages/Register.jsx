import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PhoneInput from '../components/PhoneInput';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '',
    role: 'retailer', business: '', location: ''
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handle = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      await register(form);
      nav('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🔗</span>
          </div>
          <h1 className="text-3xl font-bold text-white">TradeLink</h1>
          <p className="text-green-200">Create your account / መለያ ፍጠር</p>
          <p className="text-green-300 text-xs mt-1">🌍 Open to Ethiopian customers worldwide</p>
        </div>

        <div className="card">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {err}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">

            {/* Role selector */}
            <div>
              <label className="label">I am a / እኔ ነኝ</label>
              <div className="grid grid-cols-2 gap-3">
                {['supplier', 'retailer'].map(r => (
                  <button key={r} type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                      form.role === r
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {r === 'supplier' ? '🏭 Supplier / አቅራቢ' : '🏪 Retailer / ቸርቻሪ'}
                  </button>
                ))}
              </div>
            </div>

            {/* Name + Business */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Full Name / ሙሉ ስም</label>
                <input className="input" value={form.name} onChange={set('name')}
                  required placeholder="Abebe Kebede" />
              </div>
              <div>
                <label className="label">Business Name</label>
                <input className="input" value={form.business} onChange={set('business')}
                  placeholder="Abebe Trading" />
              </div>
            </div>

            {/* Phone with country code */}
            <div>
              <label className="label">Phone Number / ስልክ ቁጥር</label>
              <PhoneInput
                required
                onChange={(fullNumber) => setForm(prev => ({ ...prev, phone: fullNumber }))}
              />
              <p className="text-xs text-gray-400 mt-1">
                Select your country flag, then enter your local number
              </p>
            </div>

            {/* Location + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Location / ቦታ</label>
                <input className="input" value={form.location} onChange={set('location')}
                  placeholder="e.g. Washington DC" />
              </div>
              <div>
                <label className="label">Email (optional)</label>
                <input className="input" type="email" value={form.email} onChange={set('email')}
                  placeholder="you@email.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password / የሚስጥር ቁጥር</label>
              <input className="input" type="password" value={form.password}
                onChange={set('password')} required placeholder="At least 6 characters" minLength={6} />
            </div>

            <button className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account / መለያ ፍጠር'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 font-medium hover:underline">
              Sign in / ግባ
            </Link>
          </p>
        </div>

        {/* Worldwide flag strip */}
        <div className="mt-5 text-center">
          <p className="text-green-300 text-xs mb-2">Serving Ethiopian communities in</p>
          <div className="flex justify-center gap-1 text-xl flex-wrap">
            {['🇪🇹','🇺🇸','🇬🇧','🇦🇪','🇸🇦','🇨🇦','🇸🇪','🇩🇪','🇫🇷','🇮🇹','🇳🇴','🇰🇪','🇸🇴','🇸🇩'].map(f => (
              <span key={f}>{f}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
