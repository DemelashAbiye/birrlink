import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils';
import {
  MessageCircle,
  Send,
  Mail,
  PhoneCall,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  MapPin,
  GraduationCap,
  Award,
  Globe,
  Clock,
  ArrowRight
} from 'lucide-react';
import BirrLinkLogo, { BirrLinkIcon } from './BirrLinkLogo';

export default function AboutContactSection({ showAbout = true, showContact = true }) {
  const { lang } = useAuth();
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const contacts = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      subtitle: t(lang, 'Instant response · Rate locking & Pilot tests', 'ፈጣን ምላሽ · ዋጋ መቆለፍ እና የሙከራ ልውውጥ'),
      value: '+33 7 73 55 22 39',
      displayValue: '+33 7 73 55 22 39',
      href: "https://wa.me/33773552239?text=Hello%20Demelash,%20I%20am%20contacting%20you%20from%20BirrLink%20regarding%20today's%20exchange%20rate.",
      actionLabel: t(lang, 'Open WhatsApp Chat', 'በዋትስአፕ አውራ'),
      badge: 'Online ⚡',
      badgeColor: 'bg-emerald-400 text-slate-950 font-black',
      iconBg: 'bg-emerald-500 text-white shadow-emerald-500/30',
      icon: <MessageCircle size={22} />,
      borderGlow: 'hover:border-emerald-300',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      subtitle: t(lang, 'Direct messaging & Community announcements', 'ቀጥታ መልእክት እና ማስታወቂያዎች'),
      value: 'https://t.me/demi_DAD',
      displayValue: '@demi_DAD',
      href: 'https://t.me/demi_DAD',
      actionLabel: t(lang, 'Open Telegram DM', 'በቴሌግራም አውራ'),
      badge: 'Active ✈️',
      badgeColor: 'bg-cyan-400 text-slate-950 font-black',
      iconBg: 'bg-cyan-500 text-white shadow-cyan-500/30',
      icon: <Send size={20} className="translate-x-0.5 -translate-y-0.5" />,
      borderGlow: 'hover:border-cyan-300',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      subtitle: t(lang, 'Official profile & Diaspora community updates', 'ኦፊሴላዊ ገጽ እና የዳያስፖራ ማህበረሰብ መረጃዎች'),
      value: 'https://instagram.com/abiyedemelash',
      displayValue: '@abiyedemelash (demi_12)',
      href: 'https://instagram.com/abiyedemelash',
      actionLabel: t(lang, 'View Instagram Profile', 'ኢንስታግራም ተመልከት'),
      badge: 'Follow 📸',
      badgeColor: 'bg-pink-400 text-slate-950 font-black',
      iconBg: 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white shadow-pink-500/30',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      borderGlow: 'hover:border-pink-300',
    },
    {
      id: 'email',
      name: 'Official University Email',
      subtitle: t(lang, 'Official French academic inbox for institutional verification', 'ህጋዊ የፈረንሳይ ዩኒቨርሲቲ ኢሜይል አድራሻ'),
      value: 'demelash.deguale@etu.emse.fr',
      displayValue: 'demelash.deguale@etu.emse.fr',
      href: 'mailto:demelash.deguale@etu.emse.fr?subject=BirrLink%20Exchange%20Inquiry',
      actionLabel: t(lang, 'Send Academic Email', 'ኢሜይል ጻፍ'),
      badge: 'Academic 🎓',
      badgeColor: 'bg-amber-400 text-slate-950 font-black',
      iconBg: 'bg-amber-500 text-slate-950 shadow-amber-500/30',
      icon: <Mail size={22} />,
      borderGlow: 'hover:border-amber-300',
    },
    {
      id: 'phone',
      name: 'Direct Phone Line',
      subtitle: t(lang, 'Direct European phone call (France line)', 'የቀጥታ ስልክ ጥሪ (ፈረንሳይ)'),
      value: '+33 7 73 55 22 39',
      displayValue: '+33 7 73 55 22 39',
      href: 'tel:+33773552239',
      actionLabel: t(lang, 'Call Directly', 'በስልክ ደውል'),
      badge: 'Europe 🇫🇷',
      badgeColor: 'bg-emerald-300 text-slate-950 font-black',
      iconBg: 'bg-teal-500 text-white shadow-teal-500/30',
      icon: <PhoneCall size={22} />,
      borderGlow: 'hover:border-teal-300',
    },
  ];

  return (
    <div className="space-y-8">
      {/* ===================== ABOUT SECTION ===================== */}
      {showAbout && (
        <section id="about" className="bg-gradient-to-br from-[#0f766e] via-[#047857] to-[#115e59] border-2 border-emerald-300 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
          {/* Subtle Ambient Glows */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-300/25 rounded-full blur-3xl pointer-events-none"></div>

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-400/40 pb-5 relative z-10">
            <div className="flex items-center gap-3.5">
              <BirrLinkIcon size={46} className="shadow-lg shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-white/20 text-white border border-white/30 font-mono px-2.5 py-0.5 rounded-full font-bold">
                    Official Operator Profile
                  </span>
                  <span className="text-xs text-emerald-200">France 🇫🇷</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  {t(lang, 'About BirrLink & Demelash Abiye Deguale', 'ስለ ቢርሊንክ እና ደመላሽ አብዬ ደጓለ')}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-400 text-emerald-100 text-xs font-bold font-mono">
                100% Verifiable Identity
              </span>
            </div>
          </div>

          {/* Bio & Academic Identity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {/* Operator Card */}
            <div className="lg:col-span-1 bg-[#064e3b]/80 border-2 border-emerald-300/50 rounded-2xl p-5 space-y-4 backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center text-xl font-black shadow-lg">
                    DD
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white leading-tight">
                      Demelash Abiye Deguale
                    </h3>
                    <p className="text-xs text-amber-300 font-bold">
                      Erasmus Mundus Scholar 🇪🇺
                    </p>
                    <p className="text-[11px] text-emerald-200">
                      Saint-Étienne, France 🇫🇷
                    </p>
                  </div>
                </div>

                <div className="bg-[#033b2c] p-3 rounded-xl border border-emerald-400/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-emerald-200">
                    <span>Institution:</span>
                    <strong className="text-white text-right">École des Mines Saint-Étienne</strong>
                  </div>
                  <div className="flex items-center justify-between text-emerald-200">
                    <span>Program:</span>
                    <strong className="text-amber-300 text-right">EMJM meta4.0</strong>
                  </div>
                  <div className="flex items-center justify-between text-emerald-200">
                    <span>Credential Ref:</span>
                    <strong className="text-white font-mono text-[10px]">#EMSE-M2-2026-META4-089</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://www.linkedin.com/in/demelash-abiye"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldCheck size={16} />
                  <span>{t(lang, 'Verify Academic Credentials', 'የተማሪነት ማስረጃውን አረጋግጥ')}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Platform Purpose & Pillars */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#064e3b]/80 border-2 border-emerald-300/50 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-3">
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-300" />
                  <span>{t(lang, 'Why BirrLink Was Created', 'ቢርሊንክ ለምን ተፈጠረ?')}</span>
                </h4>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  {t(
                    lang,
                    'Sending money back home to Ethiopia from Europe is broken by exorbitant bank commissions, unfair rates, and high fear of anonymous online black-market scams. BirrLink establishes a direct, fully identifiable community corridor operated by an Erasmus Mundus Master’s candidate in France.',
                    'ከአውሮፓ ወደ ኢትዮጵያ ገንዘብ መላክ ከፍተኛ የባንክ ኮሚሽን እና በማይታወቁ አካላት ማጭበርበር የተሞላ ነው። ቢርሊንክ በፈረንሳይ በሚገኝ የኤራስመስ ሙንዱስ ምሁር በቀጥታ የሚመራ፣ ሙሉ ማንነቱ የተረጋገጠ እና በ10 ደቂቃ ውስጥ ለቤተሰብ የሚደርስ አስተማማኝ አሰራር ነው።'
                  )}
                </p>
              </div>

              {/* 3 Trust Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#033b2c] border border-emerald-400/50 p-3.5 rounded-xl space-y-1.5 shadow-md">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/30 text-amber-300 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <h5 className="font-black text-white text-xs">Zero Anonymity</h5>
                  <p className="text-[11px] text-emerald-200 leading-relaxed">
                    French student visa, verified university email, and legal IBAN matching.
                  </p>
                </div>

                <div className="bg-[#033b2c] border border-emerald-400/50 p-3.5 rounded-xl space-y-1.5 shadow-md">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/30 text-amber-300 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <h5 className="font-black text-white text-xs">€20 Small Pilot</h5>
                  <p className="text-[11px] text-emerald-200 leading-relaxed">
                    Never risk large funds first. Test execution speed with a small €20 transfer.
                  </p>
                </div>

                <div className="bg-[#033b2c] border border-emerald-400/50 p-3.5 rounded-xl space-y-1.5 shadow-md">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/30 text-amber-300 flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <h5 className="font-black text-white text-xs">Bank Receipts</h5>
                  <p className="text-[11px] text-emerald-200 leading-relaxed">
                    Tamper-proof digital certificates verifiable by CBE / Telebirr SMS references.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================== CONTACT SECTION ===================== */}
      {showContact && (
        <section id="contact" className="bg-gradient-to-br from-[#0f766e] via-[#047857] to-[#115e59] border-2 border-emerald-300 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
          {/* Subtle Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-400/40 pb-5 relative z-10">
            <div className="flex items-center gap-3.5">
              <span className="p-3 rounded-2xl bg-amber-400 text-slate-950 shadow-lg">
                <PhoneCall size={26} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-white/20 text-white border border-white/30 font-mono px-2.5 py-0.5 rounded-full font-bold">
                    Clickable Channels
                  </span>
                  <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                    Direct Access
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  {t(lang, 'Direct Contact & Verification Channels', 'የቀጥታ ግንኙነት እና ማረጋገጫ መንገዶች')}
                </h2>
              </div>
            </div>
            <p className="text-xs text-emerald-100 max-w-xs">
              {t(
                lang,
                'Click any channel below to message or call Demelash directly for live rates, pilot tests, or settlement support.',
                'ቀጥታ ለመደወል፣ በዋትስአፕ ወይም በቴሌግራም ለማውራት ከታች ያሉትን አማራጮች ይጫኑ።'
              )}
            </p>
          </div>

          {/* 5 Clickable Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {contacts.map((c) => {
              const isCopied = copiedKey === c.id;
              return (
                <div
                  key={c.id}
                  className={`bg-[#064e3b]/80 border-2 border-emerald-300/40 ${c.borderGlow} rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-between gap-4 transition-all duration-200 transform hover:-translate-y-1 group`}
                >
                  <div className="space-y-3">
                    {/* Channel Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${c.iconBg}`}>
                          {c.icon}
                        </div>
                        <div>
                          <h4 className="font-black text-white text-sm group-hover:text-amber-300 transition-colors">
                            {c.name}
                          </h4>
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold mt-0.5 ${c.badgeColor}`}>
                            {c.badge}
                          </span>
                        </div>
                      </div>

                      {/* Quick Copy Button */}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(c.value, c.id)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          isCopied
                            ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                            : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-400/40'
                        }`}
                        title="Copy to clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check size={14} />
                            <span className="text-[10px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Value & Subtitle */}
                    <div className="bg-[#033b2c] p-2.5 rounded-xl border border-emerald-400/30">
                      <p className="font-mono text-xs font-bold text-white tracking-wide truncate">
                        {c.displayValue}
                      </p>
                      <p className="text-[11px] text-emerald-200/90 mt-1 leading-snug">
                        {c.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Clickable Action Link */}
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{c.actionLabel}</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              );
            })}

            {/* Quick Campus & In-Person Verification Box */}
            <div className="bg-gradient-to-br from-[#064e3b]/90 to-[#043b2d]/90 border-2 border-amber-400/60 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-amber-300">
                  <MapPin size={22} />
                  <h4 className="font-black text-white text-sm">
                    In-Person / Campus Meetup
                  </h4>
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Located in <strong>Saint-Étienne, France</strong>. Available for in-person handoffs or video identity verification on WhatsApp / Telegram for community members across Auvergne-Rhône-Alpes and Europe.
                </p>
                <div className="bg-[#022b20] p-2.5 rounded-xl border border-emerald-500/40 text-[11px] text-emerald-200">
                  📍 École des Mines Saint-Étienne Campus, 42023 Saint-Étienne, France
                </div>
              </div>

              <a
                href="https://wa.me/33773552239?text=Hello%20Demelash,%20I%20would%20like%20to%20request%20a%20quick%20video%20identity%20call."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-emerald-50 text-emerald-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Request Video Identity Call</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
