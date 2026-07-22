import React from 'react';
import { Scissors, MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';
import { Language } from '../types';
import { t } from '../translations';

interface FooterProps {
  lang: Language;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenBooking }) => {
  return (
    <footer id="location" className="bg-[#0A0A0A] text-stone-400 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-600 rotate-45 flex items-center justify-center shrink-0">
                <Scissors className="w-4 h-4 text-amber-500 -rotate-45" />
              </div>
              <span className="font-serif text-lg font-bold tracking-widest text-white uppercase">
                BARBERIA ELITE
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t(lang, 'footer.about')}
            </p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">
              {t(lang, 'footer.hours_title')}
            </h4>
            <div className="text-xs text-stone-400 space-y-2">
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{t(lang, 'footer.hours_mon_sat')}</span>
              </p>
              <p className="text-stone-500 pl-5">{t(lang, 'footer.hours_sun')}</p>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">
              {t(lang, 'footer.address_title')}
            </h4>
            <div className="text-xs text-stone-400 space-y-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Via Montenapoleone 14, 20121 Milano</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>+39 02 1234567</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>info@barberia-elite.it</span>
              </p>
            </div>
          </div>

          {/* CTA & Social */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">
              Prenotazione Rapida
            </h4>
            <button
              onClick={onOpenBooking}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-[11px] tracking-[0.2em] transition-transform active:scale-[0.98] cursor-pointer"
            >
              {t(lang, 'nav.book')}
            </button>
            <div className="flex items-center gap-3 text-stone-400 pt-1">
              <a href="#" className="hover:text-amber-500 p-2.5 bg-stone-900 border border-stone-800 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-amber-500 p-2.5 bg-stone-900 border border-stone-800 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Map Preview Embed */}
        <div className="w-full h-48 border border-stone-800 mb-12 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
          <iframe
            title="Barberia Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2798.118228391219!2d9.192998315557!3d45.46820597910101!2m3!1f0!1f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c6aeebe13289%3A0xe536d50731f86f6f!2sVia%20Monte%20Napoleone%2C%2020121%20Milano%20MI!5e0!3m2!1sit!2sit!4v1680000000000!5m2!1sit!2sit"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} {t(lang, 'footer.rights')}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-stone-300">Privacy Policy (GDPR)</a>
            <a href="#" className="hover:text-stone-300">Termini e Condizioni</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
