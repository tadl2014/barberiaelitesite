import React, { useState } from 'react';
import { Scissors, Globe, Calendar, ShieldCheck, Code, Menu, X } from 'lucide-react';
import { Language } from '../types';
import { t } from '../translations';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (newLang: Language) => void;
  onOpenBooking: () => void;
  onOpenManage: () => void;
  onOpenAdmin: () => void;
  onOpenLaravel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  onOpenBooking,
  onOpenManage,
  onOpenAdmin,
  onOpenLaravel,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-stone-800/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        
        {/* Brand Logo with Immersive UI Rotated Square */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-8 h-8 border-2 border-amber-600 rotate-45 flex items-center justify-center transition-transform group-hover:rotate-90 duration-300">
            <span className="text-xs font-bold -rotate-45 text-amber-500 font-serif">B</span>
          </div>
          <div>
            <span className="text-lg font-serif font-bold tracking-[0.2em] text-white uppercase block">
              THE BARBERUS
            </span>
            <span className="text-[9px] tracking-[0.25em] text-amber-500 uppercase font-sans font-bold block -mt-1">
              GROOMING & BARBERING STUDIO
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.15em] font-medium text-stone-400">
          <a href="#services" className="hover:text-amber-500 transition-colors">
            {t(lang, 'nav.services')}
          </a>
          <a href="#barbers" className="hover:text-amber-500 transition-colors">
            {t(lang, 'nav.barbers')}
          </a>
          <a href="#location" className="hover:text-amber-500 transition-colors">
            {t(lang, 'nav.contact')}
          </a>
          
          <button
            onClick={onOpenManage}
            className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            {t(lang, 'nav.my_booking')}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-5">
          
          {/* Laravel Code Export Drawer Trigger */}
          <button
            onClick={onOpenLaravel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-[10px] font-mono text-emerald-400 border border-stone-800 transition-all cursor-pointer"
            title="View Laravel Backend Code Base"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Laravel Code</span>
          </button>

          {/* Admin Staff Portal */}
          <button
            onClick={onOpenAdmin}
            className="p-2 text-stone-400 hover:text-amber-500 transition-colors cursor-pointer rounded-lg hover:bg-stone-900"
            title={t(lang, 'nav.admin')}
          >
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </button>

          {/* Language Switcher Pill */}
          <div className="flex items-center gap-3 bg-stone-900 px-3.5 py-1.5 rounded-full border border-stone-800">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => onLanguageChange(l.code)}
                className={`text-[10px] font-bold transition-all cursor-pointer ${
                  lang === l.code
                    ? 'text-amber-500 underline underline-offset-4'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Book Now Button */}
          <button
            onClick={onOpenBooking}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-amber-600/10 cursor-pointer"
          >
            {t(lang, 'nav.book')}
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#12141B] border-b border-[#2A241A] px-4 py-6 space-y-4">
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-300 font-medium py-2 hover:text-[#D4AF37]"
          >
            {t(lang, 'nav.services')}
          </a>
          <a
            href="#barbers"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-300 font-medium py-2 hover:text-[#D4AF37]"
          >
            {t(lang, 'nav.barbers')}
          </a>
          <a
            href="#location"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-300 font-medium py-2 hover:text-[#D4AF37]"
          >
            {t(lang, 'nav.contact')}
          </a>
          
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenManage();
            }}
            className="w-full text-left py-2 text-gray-300 font-medium flex items-center gap-2 hover:text-[#D4AF37]"
          >
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            {t(lang, 'nav.my_booking')}
          </button>

          <div className="flex items-center justify-between pt-4 border-t border-[#2A241A]">
            <div className="flex items-center gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => onLanguageChange(l.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    lang === l.code
                      ? 'bg-[#D4AF37] text-black'
                      : 'bg-[#1D212B] text-gray-300'
                  }`}
                >
                  {l.flag} {l.code.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLaravel();
              }}
              className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20"
            >
              Laravel Code
            </button>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenBooking();
            }}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black font-bold text-sm tracking-wider uppercase"
          >
            {t(lang, 'nav.book')}
          </button>
        </div>
      )}
    </header>
  );
};
