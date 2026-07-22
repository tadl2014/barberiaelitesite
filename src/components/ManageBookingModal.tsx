import React, { useState } from 'react';
import { X, Search, Calendar, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Appointment, Language } from '../types';
import { t } from '../translations';
import { fetchAppointments, updateAppointmentStatus } from '../services/api';

interface ManageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ManageBookingModal: React.FC<ManageBookingModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMsg(null);
    try {
      const data = await fetchAppointments(undefined, undefined, searchQuery.trim());
      setResults(data);
    } catch (err) {
      console.error(err);
      setMsg('Errore durante la ricerca.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (!window.confirm(t(lang, 'manage.cancel_confirm'))) return;

    try {
      await updateAppointmentStatus(id, 'cancelled');
      setMsg(t(lang, 'manage.cancel_success'));
      // refresh results
      if (searchQuery) {
        const data = await fetchAppointments(undefined, undefined, searchQuery.trim());
        setResults(data);
      }
    } catch (err) {
      console.error(err);
      setMsg('Impossibile annullare l\'appuntamento.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#12151D] border border-[#2D281E] rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A241A] bg-[#0E1017]">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="text-lg font-serif font-bold text-white">
                {t(lang, 'manage.title')}
              </h3>
              <p className="text-xs text-gray-400">
                {t(lang, 'manage.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder={t(lang, 'manage.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181C26] border border-[#2D281E] text-white text-xs focus:border-[#D4AF37] outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C048] text-black font-bold text-xs cursor-pointer transition-all"
            >
              {loading ? '...' : t(lang, 'manage.btn_search')}
            </button>
          </form>

          {msg && (
            <p className="text-xs text-emerald-400 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              {msg}
            </p>
          )}

          {/* Results List */}
          {results !== null && (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 bg-[#161922] rounded-2xl border border-[#27231A]">
                  {t(lang, 'manage.no_results')}
                </div>
              ) : (
                results.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-[#171A24] border border-[#2A251B] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-[#D4AF37] text-sm">
                          {app.booking_code}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                            app.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : app.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {app.status === 'confirmed'
                            ? t(lang, 'manage.status_confirmed')
                            : app.status === 'completed'
                            ? t(lang, 'manage.status_completed')
                            : t(lang, 'manage.status_cancelled')}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-white">
                        {app.service?.name_it}
                      </h5>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Barber: {app.barber?.name} | {app.appointment_date} @ {app.start_time} - {app.end_time}
                      </p>
                    </div>

                    {app.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelAppointment(app.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t(lang, 'manage.btn_cancel')}</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
