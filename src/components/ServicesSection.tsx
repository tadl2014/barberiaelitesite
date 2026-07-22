import React, { useState } from 'react';
import { Clock, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Service, Language } from '../types';
import { t } from '../translations';

interface ServicesSectionProps {
  services: Service[];
  lang: Language;
  onSelectServiceForBooking: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  lang,
  onSelectServiceForBooking,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', labelKey: 'services.filter_all' },
    { id: 'hair', labelKey: 'services.filter_hair' },
    { id: 'beard', labelKey: 'services.filter_beard' },
    { id: 'combo', labelKey: 'services.filter_combo' },
    { id: 'treatment', labelKey: 'services.filter_treatment' },
  ];

  const filteredServices =
    activeCategory === 'all'
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <section id="services" className="py-20 bg-[#0D0D0D] border-b border-stone-800/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-amber-500 text-xs font-bold tracking-[0.3em] uppercase block mb-2">
            I Nostri Trattamenti
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-4">
            {t(lang, 'services.title')}
          </h2>
          <p className="text-stone-400 font-sans text-sm sm:text-base">
            {t(lang, 'services.subtitle')}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-600 text-black shadow-lg shadow-amber-600/20'
                  : 'bg-stone-900 text-stone-400 hover:bg-stone-800 hover:text-white border border-stone-800'
              }`}
            >
              {t(lang, cat.labelKey)}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const name = service[`name_${lang}` as keyof Service] as string || service.name_it;
            const description = service[`description_${lang}` as keyof Service] as string || service.description_it;

            return (
              <div
                key={service.id}
                className="bg-[#111111] border border-stone-800 hover:border-amber-600/50 p-6 flex flex-col justify-between group transition-all duration-300 relative"
              >
                {service.popular && (
                  <div className="absolute -top-3 right-6 bg-amber-600 text-black font-bold text-[9px] tracking-widest uppercase px-3 py-1 shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{t(lang, 'services.popular')}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-amber-500 transition-colors">
                      {name}
                    </h3>
                    <span className="text-2xl font-serif font-bold text-amber-500 shrink-0">
                      €{service.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-stone-400 mb-4">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {service.duration_minutes} {t(lang, 'services.duration')}
                    </span>
                  </div>

                  <p className="text-stone-400 text-xs leading-relaxed mb-6">
                    {description}
                  </p>
                </div>

                <button
                  onClick={() => onSelectServiceForBooking(service)}
                  className="w-full py-3.5 px-4 bg-stone-900 group-hover:bg-amber-600 text-stone-300 group-hover:text-black font-bold text-[11px] tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-800 group-hover:border-transparent"
                >
                  <span>{t(lang, 'services.book_now')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
