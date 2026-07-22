import React from 'react';
import { Scissors, Star, Award, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { t } from '../translations';

interface HeroProps {
  lang: Language;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onOpenBooking }) => {
  return (
    <section className="relative bg-[#0A0A0A] pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden border-b border-stone-800/60">
      
      {/* Immersive Background Glow Layer */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/25 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stone-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Subtle Background Image Texture */}
      <div className="absolute inset-0 z-0 opacity-15">
        <img
          src="/src/assets/images/barber_shop_hero_1784737936757.jpg"
          alt="Barber Shop Interior"
          className="w-full h-full object-cover object-center filter grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-3xl">
          
          {/* Eyebrow Badge */}
          <span className="text-amber-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">
            THE BARBERUS • LUXURY GROOMING STUDIO
          </span>

          {/* Immersive Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif leading-[1.1] text-white mb-6 italic tracking-tight">
            Scolpito <br />
            <span className="text-amber-500 not-italic">per il Successo.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-stone-400 text-sm sm:text-base font-sans leading-relaxed mb-8 max-w-xl">
            {t(lang, 'hero.subtitle')}
          </p>

          {/* Opening Hours Pill */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-stone-400 mb-10 bg-stone-900/80 border border-stone-800 px-4 py-3 rounded-full max-w-xl backdrop-blur-md">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{t(lang, 'hero.hours')}</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-16">
            <button
              onClick={onOpenBooking}
              className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-amber-600/15 cursor-pointer flex items-center justify-center gap-3"
            >
              <span>{t(lang, 'hero.cta_book')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#services"
              className="px-8 py-4 border border-stone-700 hover:border-amber-500 hover:bg-stone-900/50 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center"
            >
              {t(lang, 'hero.cta_services')}
            </a>
          </div>

        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-stone-800/80">
          
          <div className="bg-[#111111] p-6 border border-stone-800/80">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Star className="w-4 h-4 fill-amber-500" />
              <span className="text-2xl font-serif font-bold text-white">4.98</span>
              <span className="text-xs text-stone-500">/ 5.0</span>
            </div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{t(lang, 'hero.stat_rating')}</p>
          </div>

          <div className="bg-[#111111] p-6 border border-stone-800/80">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Users className="w-4 h-4 text-amber-500" />
              <span className="text-2xl font-serif font-bold text-white">3</span>
            </div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{t(lang, 'hero.stat_barbers')}</p>
          </div>

          <div className="bg-[#111111] p-6 border border-stone-800/80">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-2xl font-serif font-bold text-white">15+</span>
            </div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{t(lang, 'hero.stat_years')}</p>
          </div>

          <div className="bg-[#111111] p-6 border border-stone-800/80">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Scissors className="w-4 h-4 text-amber-500" />
              <span className="text-2xl font-serif font-bold text-white">850+</span>
            </div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{t(lang, 'hero.stat_clients')}</p>
          </div>

        </div>
      </div>
    </section>
  );
};
