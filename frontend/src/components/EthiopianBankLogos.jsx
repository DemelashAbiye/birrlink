import React from 'react';

/**
 * Exact, official image logos for Ethiopian financial institutions
 * Downloaded directly from official brand repositories:
 * - Commercial Bank of Ethiopia (CBE)
 * - Telebirr SuperApp (Ethio Telecom)
 * - Awash Bank
 * - Bank of Abyssinia (BOA)
 * - Dashen Bank
 */

export function CbeLogo({ className = 'w-12 h-12' }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} title="Commercial Bank of Ethiopia">
      <img
        src="/logos/cbe.jpg"
        alt="Commercial Bank of Ethiopia (CBE)"
        className="w-full h-full object-contain rounded-xl shadow-sm"
        loading="lazy"
      />
    </div>
  );
}

export function TelebirrLogo({ className = 'w-12 h-12' }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} title="Telebirr (Ethio Telecom)">
      <img
        src="/logos/telebirr.png"
        alt="Telebirr (Ethio Telecom)"
        className="w-full h-full object-contain rounded-xl shadow-sm"
        loading="lazy"
      />
    </div>
  );
}

export function AwashLogo({ className = 'w-12 h-12' }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} title="Awash Bank">
      <img
        src="/logos/awash.png"
        alt="Awash Bank"
        className="w-full h-full object-contain drop-shadow-sm"
        loading="lazy"
      />
    </div>
  );
}

export function BoaLogo({ className = 'w-12 h-12' }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} title="Bank of Abyssinia">
      <img
        src="/logos/boa.png"
        alt="Bank of Abyssinia (BOA)"
        className="w-full h-full object-contain drop-shadow-sm"
        loading="lazy"
      />
    </div>
  );
}

export function DashenLogo({ className = 'w-12 h-12' }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} title="Dashen Bank">
      <img
        src="/logos/dashen.png"
        alt="Dashen Bank"
        className="w-full h-full object-contain drop-shadow-sm"
        loading="lazy"
      />
    </div>
  );
}
