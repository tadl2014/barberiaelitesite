import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Calendar,
  Filter,
  Check,
  Trash2,
  Plus,
  RefreshCw,
  Users,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Appointment, Barber, Service, Language } from '../types';
import { t } from '../translations';
import {
  fetchAppointments,
  updateAppointmentStatus,
  toggleBarberActive,
  resetDemoData,
  createAppointment,
} from '../services/api';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  barbers: Barber[];
  services: Service[];
  lang: Language;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  barbers,
  services,
  lang,
  onRefreshData,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedBarberId, setSelectedBarberId] = useState<number>(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  // Walk-In Modal State
  const [walkinModalOpen, setWalkinModalOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinServiceId, setWalkinServiceId] = useState<number>(
    services[0]?.id || 1
  );
  const [walkinBarberId, setWalkinBarberId] = useState<number>(
    barbers[0]?.id || 1
  );
  const [walkinTime, setWalkinTime] = useState('11:00');

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await fetchAppointments(selectedDate, selectedBarberId);
      setAppointments(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, selectedDate, selectedBarberId]);

  if (!isOpen) return null;

  const handleStatusChange = async (
    id: number,
    status: 'confirmed' | 'completed' | 'cancelled'
  ) => {
    try {
      await updateAppointmentStatus(id, status);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBarber = async (barberId: number) => {
    try {
      await toggleBarberActive(barberId);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetData = async () => {
    if (
      window.confirm('Ripristinare tutti i dati dimostrativi iniziali?')
    ) {
      await resetDemoData();
      onRefreshData();
      loadData();
    }
  };

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment({
        customer_name: walkinName || 'Cliente Walk-in',
        customer_phone: walkinPhone || '+39 000 000000',
        customer_email: 'walkin@barberia-elite.it',
        service_id: walkinServiceId,
        barber_id: walkinBarberId,
        appointment_date: selectedDate,
        start_time: walkinTime,
      });

      setWalkinModalOpen(false);
      setWalkinName('');
      setWalkinPhone('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Errore nella creazione del walk-in');
    }
  };

  // Stats calculation
  const totalToday = appointments.length;
  const completedToday = appointments.filter((a) => a.status === 'completed').length;
  const revenueToday = appointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.service?.price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#10131B] border border-[#2D281E] rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A241A] bg-[#0A0C12]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-white">
                {t(lang, 'admin.title')}
              </h3>
              <p className="text-xs text-gray-400">
                {t(lang, 'admin.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#222736] border border-[#2B261D] text-xs font-semibold text-gray-300 flex items-center gap-1.5 cursor-pointer"
              title="Reset Demo Data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">{t(lang, 'admin.reset_data')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="p-6 space-y-6">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#161923] border border-[#29241B] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-serif font-bold text-white">{totalToday}</span>
                <p className="text-xs text-gray-400">{t(lang, 'admin.stats_today')}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#161923] border border-[#29241B] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-serif font-bold text-white">€{revenueToday}</span>
                <p className="text-xs text-gray-400">{t(lang, 'admin.stats_revenue')}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#161923] border border-[#29241B] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-serif font-bold text-white">{completedToday}</span>
                <p className="text-xs text-gray-400">{t(lang, 'admin.stats_completed')}</p>
              </div>
            </div>
          </div>

          {/* Filters & Walk-In Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#151822] border border-[#2A241A]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t(lang, 'admin.filter_date')}</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#1D212E] border border-[#2D281E] text-white text-xs font-semibold outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-300">
                <span>{t(lang, 'admin.filter_barber')}</span>
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg bg-[#1D212E] border border-[#2D281E] text-white text-xs font-semibold outline-none"
                >
                  <option value={0}>{t(lang, 'admin.filter_all')}</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setWalkinModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C048] text-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{t(lang, 'admin.add_walkin')}</span>
            </button>
          </div>

          {/* Appointments Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#27231A] bg-[#141720]">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0E1017] text-gray-400 font-mono uppercase tracking-wider border-b border-[#2A241A]">
                <tr>
                  <th className="p-4">{t(lang, 'admin.table_code')}</th>
                  <th className="p-4">{t(lang, 'admin.table_client')}</th>
                  <th className="p-4">{t(lang, 'admin.table_service')}</th>
                  <th className="p-4">{t(lang, 'admin.table_barber')}</th>
                  <th className="p-4">{t(lang, 'admin.table_time')}</th>
                  <th className="p-4">{t(lang, 'admin.table_status')}</th>
                  <th className="p-4 text-right">{t(lang, 'admin.table_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#211E17]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      Caricamento appuntamenti...
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Nessun appuntamento per i filtri selezionati.
                    </td>
                  </tr>
                ) : (
                  appointments.map((app) => (
                    <tr key={app.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#D4AF37]">
                        {app.booking_code}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white">{app.customer_name}</div>
                        <div className="text-[10px] text-gray-400">{app.customer_phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-200">
                          {app.service?.name_it}
                        </div>
                        <div className="text-[10px] text-[#D4AF37]">
                          €{app.service?.price} ({app.service?.duration_minutes}m)
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-300">
                        {app.barber?.name}
                      </td>
                      <td className="p-4 font-mono font-semibold text-white">
                        {app.start_time} - {app.end_time}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            app.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : app.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(app.id, 'completed')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              title={t(lang, 'admin.mark_complete')}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {app.status !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(app.id, 'cancelled')}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                              title="Annulla"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Barbers Roster Status Bar */}
          <div className="p-5 rounded-2xl bg-[#151822] border border-[#2A241A]">
            <h4 className="text-xs font-serif font-bold text-white mb-3 uppercase tracking-wider text-[#D4AF37]">
              Stato Operativo Barber Staff
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {barbers.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-[#1B1F2C] border border-[#2D281E] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        b.is_active ? 'bg-emerald-400' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-xs font-semibold text-white">{b.name}</span>
                  </div>

                  <button
                    onClick={() => handleToggleBarber(b.id)}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-[#131620] text-gray-300 hover:text-white border border-[#2D281E] cursor-pointer"
                  >
                    {b.is_active ? 'Disattiva' : 'Attiva'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Walk-in Modal Overlay */}
        {walkinModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#141722] border border-[#2D281E] p-6 rounded-2xl w-full max-w-md space-y-4">
              <h4 className="text-base font-serif font-bold text-white">
                Aggiungi Prenotazione Walk-In
              </h4>

              <form onSubmit={handleCreateWalkin} className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome Cliente"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1E2C] border border-[#2D281E] text-white text-xs outline-none"
                />

                <input
                  type="text"
                  placeholder="Telefono"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1E2C] border border-[#2D281E] text-white text-xs outline-none"
                />

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Servizio</label>
                  <select
                    value={walkinServiceId}
                    onChange={(e) => setWalkinServiceId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1E2C] border border-[#2D281E] text-white text-xs outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name_it} (€{s.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Barber</label>
                  <select
                    value={walkinBarberId}
                    onChange={(e) => setWalkinBarberId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1E2C] border border-[#2D281E] text-white text-xs outline-none"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Orario di Inizio</label>
                  <input
                    type="time"
                    value={walkinTime}
                    onChange={(e) => setWalkinTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1E2C] border border-[#2D281E] text-white text-xs outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWalkinModalOpen(false)}
                    className="w-1/2 py-2 rounded-xl bg-[#222736] text-gray-300 text-xs font-semibold cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-bold cursor-pointer"
                  >
                    Salva Walk-In
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
