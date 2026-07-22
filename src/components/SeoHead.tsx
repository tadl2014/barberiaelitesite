import React, { useEffect } from 'react';
import { Language } from '../types';

interface SeoHeadProps {
  lang: Language;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ lang }) => {
  useEffect(() => {
    // 1. Update <html lang="..."> tag
    document.documentElement.lang = lang;

    // 2. Titles based on language
    const titles: Record<Language, string> = {
      it: 'The Barberus | Taglio Uomo, Barba & Rasatura Tradizionale',
      en: 'The Barberus | Men\'s Haircut, Beard Grooming & Shaving',
      fr: 'The Barberus | Coupe Homme, Barbe & Rasage Traditionnel',
      ar: 'ذا باربيروس | استوديو الحلاقة الفاخرة والعناية بالرجل',
    };
    document.title = titles[lang];

    // 3. Meta descriptions
    const descriptions: Record<Language, string> = {
      it: 'Prenota online il tuo appuntamento da The Barberus. Tagli di capelli sartoriali, sfumature razor fade e rasatura tradizionale con panno caldo.',
      en: 'Book online at The Barberus. Bespoke haircuts, razor fades, and traditional hot towel shaving.',
      fr: 'Réservez en ligne chez The Barberus. Coupes sur mesure, dégradés au rasoir et rasage traditionnel à la serviette chaude.',
      ar: 'احجز موعدك أونلاين لدى استوديو ذا باربيروس. قص شعر مخصص، تدريج بالموس وحلاقة تقليدية مع الفوطة الساخنة.',
    };

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', descriptions[lang]);

    // 4. Inject Schema.org JSON-LD for BarberShop / BeautySalon
    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'BarberShop',
      'name': 'Barberia Elite Milano',
      'image': 'https://barberia-elite.it/assets/hero.jpg',
      'telephone': '+39 02 1234567',
      'email': 'info@barberia-elite.it',
      'priceRange': '€€',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Via Montenapoleone 14',
        'addressLocality': 'Milano',
        'postalCode': '20121',
        'addressCountry': 'IT',
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 45.4682,
        'longitude': 9.1952,
      },
      'url': window.location.href,
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          'opens': '09:00',
          'closes': '20:00',
        },
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.95',
        'reviewCount': '749',
      },
    };

    let scriptTag = document.getElementById('json-ld-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-schema';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLdData);
  }, [lang]);

  return null;
};
