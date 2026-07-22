import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { CookieSettings, Language } from '../types';
import { t } from '../translations';

interface GdprBannerProps {
  lang: Language;
}

export const GdprBanner: React.FC<GdprBannerProps> = ({ lang }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('barberia_gdpr_settings');
    if (!saved) {
      setShowBanner(true);
    }
  }, []);

  const savePreferences = (essentialOnly = false) => {
    const settings: CookieSettings = {
      essential: true,
      analytics: essentialOnly ? false : analytics,
      marketing: essentialOnly ? false : marketing,
      acceptedAt: new Date().toISOString(),
    };
    localStorage.setItem('barberia_gdpr_settings', JSON.stringify(settings));
    setShowBanner(false);
    setShowCustomizeModal(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-[#0A0A0A]/95 border-t border-stone-800 backdrop-blur-lg shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 border border-amber-600/40 bg-amber-600/10 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">
                {t(lang, 'gdpr.title')}
              </h4>
              <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                {t(lang, 'gdpr.text')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setShowCustomizeModal(true)}
              className="px-4 py-2 bg-stone-900 border border-stone-800 text-xs font-bold text-stone-300 hover:text-white uppercase tracking-wider cursor-pointer"
            >
              {t(lang, 'gdpr.btn_customize')}
            </button>

            <button
              onClick={() => savePreferences(true)}
              className="px-4 py-2 bg-stone-900 border border-stone-800 text-xs font-bold text-stone-300 hover:text-white uppercase tracking-wider cursor-pointer"
            >
              {t(lang, 'gdpr.btn_decline')}
            </button>

            <button
              onClick={() => savePreferences(false)}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-[11px] tracking-wider cursor-pointer"
            >
              {t(lang, 'gdpr.btn_accept')}
            </button>
          </div>

        </div>
      </div>

      {/* Customize Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-stone-800 p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {t(lang, 'gdpr.btn_customize')}
              </h4>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">
                    {t(lang, 'gdpr.essential')}
                  </span>
                  <span className="text-[10px] text-stone-500">Attivi per default</span>
                </div>
                <input type="checkbox" checked disabled className="accent-amber-600" />
              </div>

              <div className="p-3 bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">
                    {t(lang, 'gdpr.analytics')}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">
                    {t(lang, 'gdpr.marketing')}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => savePreferences(false)}
              className="w-full py-3 bg-amber-600 text-black font-black uppercase text-xs tracking-wider cursor-pointer"
            >
              {t(lang, 'gdpr.btn_save')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
