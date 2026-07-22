import React from 'react';
import { Star, ShieldCheck, Clock, Users, ArrowRight } from 'lucide-react';
import { Barber, Language } from '../types';
import { t } from '../translations';

interface BarbersSectionProps {
  barbers: Barber[];
  lang: Language;
  onSelectBarberForBooking: (barberId: number) => void;
}

export const BarbersSection: React.FC<BarbersSectionProps> = ({
  barbers,
  lang,
  onSelectBarberForBooking,
}) => {
  return (
    <section id="barbers" className="py-20 bg-[#0A0A0A] border-b border-stone-800/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-amber-500 text-xs font-bold tracking-[0.3em] uppercase block mb-2">
            I Nostri Maestri
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-4">
            {t(lang, 'barbers.title')}
          </h2>
          <p className="text-stone-400 font-sans text-sm sm:text-base">
            {t(lang, 'barbers.subtitle')}
          </p>
        </div>

        {/* Barbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {barbers.map((barber) => {
            const bio = barber[`bio_${lang}` as keyof Barber] as string || barber.bio_it;
            const specialty = barber[`specialty_${lang}` as keyof Barber] as string || barber.specialty_it;

            return (
              <div
                key={barber.id}
                className="bg-[#111111] border border-stone-800 hover:border-amber-600/50 group transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo with Overlay */}
                  <div className="relative aspect-square overflow-hidden bg-stone-900">
                    <img
                      src={barber.photo_url}
                      alt={barber.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 filter grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-90" />
                    
                    {/* Rating Badge */}
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-stone-800 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{barber.rating}</span>
                      <span className="text-stone-500 text-[10px]">({barber.reviews_count})</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold text-white mb-1 group-hover:text-amber-500 transition-colors">
                      {barber.name}
                    </h3>
                    
                    <p className="text-xs font-bold text-amber-500 tracking-[0.2em] uppercase mb-3">
                      {specialty}
                    </p>

                    <p className="text-stone-400 text-xs leading-relaxed mb-6">
                      {bio}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => onSelectBarberForBooking(barber.id)}
                    className="w-full py-3.5 px-4 bg-stone-900 hover:bg-amber-600 text-stone-300 hover:text-black font-bold text-[11px] tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-800 hover:border-transparent"
                  >
                    <span>{t(lang, 'barbers.book_with')} {barber.name.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Any Barber Highlight Box */}
        <div className="mt-12 bg-[#111111] border border-stone-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-600/10 border border-amber-600/30 flex items-center justify-center text-amber-500 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold text-white">
                {t(lang, 'barbers.any_barber')}
              </h4>
              <p className="text-xs text-stone-400 mt-1 max-w-xl">
                {t(lang, 'barbers.any_barber_desc')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectBarberForBooking(0)}
            className="px-8 py-3.5 bg-amber-600 text-black font-bold text-xs tracking-widest uppercase hover:bg-amber-500 transition-all cursor-pointer whitespace-nowrap"
          >
            {t(lang, 'hero.cta_book')}
          </button>
        </div>

      </div>
    </section>
  );
};
