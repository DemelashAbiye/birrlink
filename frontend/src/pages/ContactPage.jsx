import React from 'react';
import { Link } from 'react-router-dom';
import AboutContactSection from '../components/AboutContactSection';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils';

export default function ContactPage() {
  const { lang } = useAuth();

  return (
    <div className="space-y-6 py-2">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all"
        >
          <ArrowLeft size={14} />
          <span>{t(lang, 'Back to Dashboard', 'ወደ ዳሽቦርድ ተመለስ')}</span>
        </Link>
        <Link
          to="/about"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
        >
          <span>{t(lang, 'About BirrLink & Operator ➔', 'ስለ ቢርሊንክ እና አስተባባሪ ➔')}</span>
        </Link>
      </div>

      <AboutContactSection showAbout={false} showContact={true} />
    </div>
  );
}
