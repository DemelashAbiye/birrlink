import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils';
import {
  ShieldCheck,
  CheckCircle2,
  Mail,
  Building,
  MapPin,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  X,
  FileText,
  Lock,
  Globe,
  Share2,
  Smartphone
} from 'lucide-react';

export default function AcademicVerificationModal({ isOpen, onClose }) {
  const { lang } = useAuth();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen) return null;

  const academicEmail = 'demelash.deguale@etu.emse.fr';
  const certId = 'EMSE-M2-2026-META4-089';

  const copyText = (text, setFn) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const getProofStatement = () => {
    return `🎓 *OFFICIAL EUROPEAN ACADEMIC CREDENTIAL PROOF*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Student & Operator:* Demelash Abiye Deguale\n` +
      `🏛️ *Institution:* École Nationale Supérieure des Mines de Saint-Étienne (France 🇫🇷)\n` +
      `🇪🇺 *Program:* Erasmus Mundus Joint Master in Manufacturing 4.0 (EMJM meta4.0)\n` +
      `📍 *Campus:* Saint-Étienne, France\n` +
      `📧 *Official University Email:* ${academicEmail}\n` +
      `📄 *Attestation Certificate ID:* #${certId}\n` +
      `🏦 *Bank Match:* Official French IBAN in exact legal name (DEMELASH ABIYE DEGUALE)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💡 *Test Verification:* Send an email to ${academicEmail} or inspect enrollment via official university directory.\n` +
      `_Zero Anonymity · 100% Verifiable Academic Standing_`;
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(getProofStatement());
    window.open(`https://wa.me/33773552239?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl shadow-2xl max-w-lg w-full text-slate-100 overflow-hidden my-6">

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-850 to-emerald-950 p-5 border-b border-emerald-800/60 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shrink-0">
                🎓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    Official European Credential
                  </span>
                  <span className="text-[11px] text-slate-400">France 🇫🇷</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Demelash Abiye Deguale
                </h3>
                <p className="text-xs text-emerald-300">
                  École des Mines Saint-Étienne (EMJM meta4.0)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: 4 Proof Layers */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            {t(
              lang,
              'Scammers hide behind anonymous burner phone numbers. Here is verifiable, third-party proof that cannot be forged or faked by anyone outside the French higher education system:',
              'አጭበርባሪዎች ስማቸው በማይታወቅ ስልክ ይደበቃሉ። ማንም ሊያጭበረብረው የማይችል በአውሮፓ የከፍተኛ ትምህርት ሚኒስቴር የተረጋገጠ ህጋዊ ማስረጃ ይኸውና:'
            )}
          </p>

          {/* Official LinkedIn Profile Verification Card */}
          <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-blue-950/90 border border-blue-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#0077b5] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                in
              </span>
              <div>
                <p className="text-xs font-bold text-white">Demelash Abiye on LinkedIn</p>
                <p className="text-[11px] text-blue-200">linkedin.com/in/demelash-abiye</p>
              </div>
            </div>
            <a
              href="https://www.linkedin.com/in/demelash-abiye"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#0077b5] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0"
            >
              <span>View Profile</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Proof 1: University Email */}
          <div className="bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Mail size={15} />
                <span>1. Official French University Email (.fr)</span>
              </div>
              <span className="badge bg-emerald-500/20 text-emerald-300 text-[10px]">
                Cryptographically Issued
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Only a legally registered Master's student in France can hold an official <code className="text-emerald-300 font-mono">@etu.emse.fr</code> domain address.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-white truncate">
                {academicEmail}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => copyText(academicEmail, setCopiedEmail)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  title="Copy email"
                >
                  {copiedEmail ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={`mailto:${academicEmail}?subject=TradeLink%20Academic%20Verification%20Check&body=Hello%20Demelash,%20verifying%20your%20academic%20identity%20at%20Ecole%20des%20Mines%20Saint-Etienne.`}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Test Send</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              💡 Tell your customer: <em>"Send a test email to my university address and I will reply from it immediately."</em>
            </p>
          </div>

          {/* Proof 2: Erasmus Mundus Joint Master Consortium */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Globe size={15} />
                <span>2. European Union EMJM meta4.0 Consortium</span>
              </div>
              <span className="badge bg-blue-500/20 text-blue-300 text-[10px]">
                EU Funded
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Enrolled in the prestigious <strong>Erasmus Mundus Joint Master</strong> in Manufacturing 4.0:
            </p>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-center pt-1 font-mono">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="block text-slate-400 text-[10px]">Sem 1 🇫🇷</span>
                <strong className="text-slate-200">ENISE Lyon</strong>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="block text-slate-400 text-[10px]">Sem 2 🇮🇹</span>
                <strong className="text-slate-200">PoliTo Turin</strong>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-emerald-500/40 text-emerald-300">
                <span className="block text-emerald-400 text-[10px]">Year 2 🇫🇷</span>
                <strong>Mines Saint-Étienne</strong>
              </div>
            </div>
          </div>

          {/* Proof 3: French Enrollment Certificate (Certificat de Scolarité) */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <FileText size={15} />
                <span>3. French University Enrollment Attestation</span>
              </div>
              <span className="badge bg-purple-500/20 text-purple-300 text-[10px]">
                Official M2 Record
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Official certificate issued under French Higher Education Code (*Code de l'éducation*):
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">Attestation Reference</span>
                <span className="text-emerald-400 font-bold">{certId}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Academic Year 2026/2027
              </span>
            </div>
          </div>

          {/* Proof 4: French Bank Account Match (FR76...) */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Lock size={15} />
                <span>4. Legal Name & French Bank Account Match</span>
              </div>
              <span className="badge bg-emerald-500/20 text-emerald-300 text-[10px]">
                Strict SEPA / KYC
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When transferring Euros, you send directly to a <strong>French IBAN (FR76...)</strong> legally registered in the exact name: <strong className="text-white">DEMELASH ABIYE DEGUALE</strong>. French banks enforce strict passport verification — zero burner or third-party proxy accounts.
            </p>
          </div>

          {/* Proof 5: Direct WhatsApp & French Mobile Line */}
          <div className="bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Smartphone size={15} />
                <span>5. Verified Direct Line & WhatsApp</span>
              </div>
              <span className="badge bg-emerald-500/20 text-emerald-300 text-[10px]">
                Active 🇫🇷 France Mobile
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-white">
                +33 7 73 55 22 39
              </span>
              <a
                href="https://wa.me/33773552239?text=Hello%20Demelash,%20I%20am%20contacting%20you%20from%20TradeLink%20to%20verify%20your%20exchange%20details."
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Chat on WhatsApp</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>100% Verifiable Academic Record in France</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={openWhatsApp}
              className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <Share2 size={13} />
              <span>Share Proof to WhatsApp</span>
            </button>
            <button
              onClick={() => copyText(getProofStatement(), setCopiedShare)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors border border-slate-700"
            >
              {copiedShare ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedShare ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-3"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
