import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { Bell, LogOut, Globe, Menu, X, LayoutDashboard, FileText, Users, AlertTriangle, UserCircle, MessageCircle, Info, PhoneCall, ShieldCheck } from 'lucide-react';
import ExchangeRateBar from './ExchangeRateBar';
import BirrLinkLogo from './BirrLinkLogo';

export default function Layout({ children }) {
  const { user, logout, lang, toggleLang } = useAuth();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return;
    api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
    const iv = setInterval(() => {
      api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(iv);
  }, [loc.pathname]);

  const doLogout = () => { logout(); nav('/login'); };

  const navItems = user?.role === 'admin'
    ? [
        { to: '/dashboard',      icon: <LayoutDashboard size={18} />, en: 'Dashboard',   am: 'ዳሽቦርድ' },
        { to: '/about',          icon: <Info size={18} />,            en: 'About',       am: 'ስለ እኛ' },
        { to: '/contact',        icon: <PhoneCall size={18} />,       en: 'Contact',     am: 'ያግኙን' },
        { to: '/verify',         icon: <ShieldCheck size={18} />,     en: 'Verify Slip', am: 'ማረጋገጫ' },
        { to: '/admin',          icon: <Users size={18} />,           en: 'Admin Panel', am: 'አስተዳዳሪ' },
      ]
    : user
    ? [
        { to: '/dashboard',   icon: <LayoutDashboard size={18} />, en: 'Dashboard',   am: 'ዳሽቦርድ' },
        { to: '/about',       icon: <Info size={18} />,            en: 'About',       am: 'ስለ እኛ' },
        { to: '/contact',     icon: <PhoneCall size={18} />,       en: 'Contact',     am: 'ያግኙን' },
        { to: '/verify',      icon: <ShieldCheck size={18} />,     en: 'Verify Slip', am: 'ማረጋገጫ' },
        { to: '/profile',     icon: <UserCircle size={18} />,      en: 'Profile',     am: 'መገለጫ' },
      ]
    : [
        { to: '/dashboard',   icon: <LayoutDashboard size={18} />, en: 'Home',        am: 'ዋና ገጽ' },
        { to: '/about',       icon: <Info size={18} />,            en: 'About',       am: 'ስለ እኛ' },
        { to: '/contact',     icon: <PhoneCall size={18} />,       en: 'Contact',     am: 'ያግኙን' },
        { to: '/verify',      icon: <ShieldCheck size={18} />,     en: 'Verify Slip', am: 'ማረጋገጫ' },
        { to: '/login',       icon: <UserCircle size={18} />,      en: 'Operator',    am: 'ግባ' },
      ];

  const isActive = to => loc.pathname === to;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Live FX Rate Bar */}
      <ExchangeRateBar />

      {/* Topbar */}
      <header className="bg-green-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <BirrLinkLogo size="md" variant="light" showTagline={true} showCorridor={true} />
          </div>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(n => (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(n.to) ? 'bg-white/20' : 'hover:bg-white/10'
                }`}>
                {n.icon} {lang === 'am' ? n.am : n.en}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="p-2 hover:bg-white/10 rounded-lg" title="Toggle language">
              <Globe size={18} />
            </button>
            {user ? (
              <>
                <Link to="/notifications" className="relative p-2 hover:bg-white/10 rounded-lg">
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>
                <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/20">
                  <Link to="/profile" className="text-right hover:opacity-80 transition-opacity">
                    <p className="text-xs font-semibold leading-tight">{user?.name}</p>
                    <p className="text-[10px] text-green-200 capitalize">{user?.role}</p>
                  </Link>
                  <button onClick={doLogout} className="p-2 hover:bg-white/10 rounded-lg" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/20">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20"
                >
                  <UserCircle size={15} />
                  <span>{lang === 'am' ? 'የአስተዳዳሪ መግቢያ' : 'Admin Login'}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/20 px-4 py-3 space-y-1">
            {navItems.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(n.to) ? 'bg-white/20' : 'hover:bg-white/10'
                }`}>
                {n.icon} {lang === 'am' ? n.am : n.en}
              </Link>
            ))}
            {user && (
              <button onClick={doLogout} className="flex items-center gap-2 px-3 py-2 text-sm w-full hover:bg-white/10 rounded-lg">
                <LogOut size={18} /> Logout
              </button>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      <footer className="bg-emerald-950 text-emerald-200 border-t border-emerald-800/60 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <BirrLinkLogo size="sm" variant="light" showTagline={false} showCorridor={true} />

          <div className="flex items-center gap-4 flex-wrap justify-center text-xs font-semibold">
            <Link to="/about" className="hover:text-amber-300 transition-colors">
              About Demelash
            </Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-amber-300 transition-colors">
              Contact Channels
            </Link>
            <span>·</span>
            <a href="https://wa.me/33773552239" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              WhatsApp (+33 7 73 55 22 39)
            </a>
            <span>·</span>
            <a href="https://t.me/demi_DAD" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">
              Telegram (@demi_DAD)
            </a>
            <span>·</span>
            <a href="https://instagram.com/abiyedemelash" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">
              Instagram (@abiyedemelash)
            </a>
            <span>·</span>
            <a href="https://www.linkedin.com/in/demelash-abiye" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
              LinkedIn (Demelash Abiye)
            </a>
            <span>·</span>
            <a href="mailto:demelash.deguale@etu.emse.fr" className="hover:text-amber-300 transition-colors">
              demelash.deguale@etu.emse.fr
            </a>
          </div>

          <div className="text-[11px] text-emerald-400">
            © 2026 BirrLink · Verified Direct Settlement
          </div>
        </div>
      </footer>

      {/* Floating Direct WhatsApp Assistance Widget */}
      <a
        href="https://wa.me/33773552239?text=Hello%20Demelash,%20I%20am%20contacting%20you%20from%20BirrLink%20regarding%20today's%20Euro%20exchange%20rate."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 border border-emerald-400/40"
        title="Chat directly with Demelash on WhatsApp (+33 7 73 55 22 39)"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <MessageCircle size={16} />
        <span>WhatsApp Assistance</span>
      </a>
    </div>
  );
}
