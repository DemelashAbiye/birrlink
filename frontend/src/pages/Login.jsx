import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PhoneInput from '../components/PhoneInput';
import AcademicVerificationModal from '../components/AcademicVerificationModal';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import BirrLinkLogo from '../components/BirrLinkLogo';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const user = await login(phone, password);
      nav('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed. Check your number and password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <BirrLinkLogo size="xl" variant="light" showTagline={true} showCorridor={true} asLink={false} />
          <p className="text-emerald-300 text-xs mt-2 font-medium">የዩሮ እና የኢትዮጵያ ብር ህጋዊ የልውውጥ መድረክ</p>
        </div>

        {/* Real, Verifiable European Academic Identity Badge */}
        <div className="mb-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center text-xs text-green-100 shadow-lg space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-green-300 font-semibold text-xs">
            <span>🎓</span>
            <span>Real, Verifiable European Academic Identity</span>
          </div>
          <div>
            <p className="font-bold text-white text-base">
              Demelash Abiye Deguale
            </p>
            <p className="text-xs text-green-200">
              Master's Candidate in Sustainable Manufacturing
            </p>
            <p className="text-[11px] text-green-300/80">
              École des Mines Saint-Étienne, France 🇫🇷 (EMJM meta4.0)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setProofModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-700/80 hover:bg-green-600 text-white font-semibold text-xs transition-colors shadow-sm border border-green-500/40"
          >
            <ShieldCheck size={14} className="text-green-300" />
            <span>Inspect Official Academic Proof</span>
            <ExternalLink size={11} />
          </button>
        </div>

        {/* Official Academic Verification Proof Modal */}
        <AcademicVerificationModal
          isOpen={proofModalOpen}
          onClose={() => setProofModalOpen(false)}
        />

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Sign In</h2>
          <p className="text-sm text-gray-500 mb-6">ግባ — Welcome back from anywhere in the world 🌍</p>

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {err}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Phone Number / ስልክ ቁጥር</label>
              <PhoneInput
                required
                onChange={(fullNumber) => setPhone(fullNumber)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Select your country code, then enter your number
              </p>
            </div>

            <div>
              <label className="label">Password / የሚስጥር ቁጥር</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In / ግባ'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            New user?{' '}
            <Link to="/register" className="text-green-700 font-medium hover:underline">
              Create account / መለያ ፍጠር
            </Link>
          </p>

          {/* Quick-fill accounts */}
          <div className="mt-6 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-2 border border-gray-200">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-700">👑 Operator & Demo Logins:</p>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Click card to auto-fill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPhone('+33773552239');
                  setPassword('admin123');
                }}
                className="bg-emerald-50/80 border border-emerald-300 hover:bg-emerald-100 rounded-lg p-2 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">👑 Demelash (Admin)</span>
                  <span className="text-[10px] text-emerald-600 font-mono">🇫🇷 +33</span>
                </div>
                <p className="text-[10px] text-emerald-800 font-mono mt-0.5">+33 7 73 55 22 39</p>
                <p className="text-[10px] text-emerald-600 font-mono">admin123</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhone('0900000000');
                  setPassword('admin123');
                }}
                className="bg-white border border-gray-200 hover:border-gray-400 rounded-lg p-2 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Admin (Backup)</span>
                  <span className="text-[10px] text-gray-500 font-mono">🇪🇹 +251</span>
                </div>
                <p className="text-[10px] text-gray-600 font-mono mt-0.5">0900000000</p>
                <p className="text-[10px] text-gray-400 font-mono">admin123</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhone('0911111111');
                  setPassword('test123');
                }}
                className="bg-white border border-gray-200 hover:border-gray-400 rounded-lg p-2 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Demo User</span>
                  <span className="text-[10px] text-gray-500 font-mono">🇪🇹 +251</span>
                </div>
                <p className="text-[10px] text-gray-600 font-mono mt-0.5">0911111111</p>
                <p className="text-[10px] text-gray-400 font-mono">test123</p>
              </button>
            </div>
          </div>
        </div>

        {/* Flag strip — Ethiopian diaspora destinations */}
        <div className="mt-6 text-center">
          <p className="text-green-300 text-xs mb-2">Available worldwide / በዓለም ዙሪያ ይገኛል</p>
          <div className="flex justify-center gap-1 text-xl flex-wrap">
            {['🇪🇹','🇺🇸','🇬🇧','🇦🇪','🇸🇦','🇨🇦','🇸🇪','🇩🇪','🇫🇷','🇮🇹','🇳🇴','🇰🇪','🇸🇴','🇸🇩'].map(f => (
              <span key={f} title={f}>{f}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
