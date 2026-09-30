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
      nav(user.role === 'admin' ? '/admin' : '/dashboard');
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

          {/* Demo accounts */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600 mb-2">🧪 Demo accounts (select 🇪🇹 +251):</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'Admin', num: '900000000', pass: 'admin123' },
                { role: 'Supplier', num: '911111111', pass: 'test123' },
                { role: 'Retailer', num: '922222222', pass: 'test123' },
              ].map(a => (
                <div key={a.role} className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                  <p className="font-semibold text-gray-700">{a.role}</p>
                  <p className="text-[10px] text-gray-500">{a.num}</p>
                  <p className="text-[10px] text-gray-400">{a.pass}</p>
                </div>
              ))}
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
