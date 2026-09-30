import { useState, useRef, useEffect } from 'react';
import { COUNTRY_CODES, DEFAULT_COUNTRY } from '../data/countryCodes';
import { ChevronDown, Search } from 'lucide-react';

/**
 * PhoneInput — combined country code picker + local number input.
 * Returns full E.164-style number via onChange: e.g. "+1 2025550101"
 * Also exposes { dialCode, localNumber } for granular control.
 */
export default function PhoneInput({ value, onChange, required, placeholder }) {
  const [selected, setSelected] = useState(DEFAULT_COUNTRY);
  const [localNumber, setLocalNumber] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const handleCountrySelect = (country) => {
    setSelected(country);
    setOpen(false);
    setSearch('');
    onChange?.(`${country.dial}${localNumber}`, country.dial, localNumber);
  };

  const handleNumberChange = (e) => {
    // Strip any non-numeric chars except spaces/dashes
    const raw = e.target.value.replace(/[^\d\s\-]/g, '');
    setLocalNumber(raw);
    onChange?.(`${selected.dial}${raw}`, selected.dial, raw);
  };

  const filtered = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-0 relative" ref={dropdownRef}>
      {/* Country code button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium min-w-[90px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:z-10"
      >
        <span className="text-base">{selected.flag}</span>
        <span className="text-gray-700">{selected.dial}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Number input */}
      <input
        type="tel"
        className="input rounded-l-none flex-1 min-w-0"
        placeholder={placeholder || '912 345 678'}
        value={localNumber}
        onChange={handleNumberChange}
        required={required}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search box */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Search country or code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Country list */}
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">No results</li>
            ) : filtered.map((c, i) => (
              <li key={`${c.code}-${i}`}>
                <button
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-green-50 transition-colors text-left ${
                    selected.code === c.code && selected.dial === c.dial ? 'bg-green-50 font-semibold text-green-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg w-6 text-center shrink-0">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-gray-400 font-mono text-xs shrink-0">{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
