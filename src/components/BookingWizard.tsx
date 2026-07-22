import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  Download,
  MessageCircle,
  Scissors,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { Service, Barber, TimeSlot, Language, Appointment } from '../types';
import { t } from '../translations';
import { fetchAvailableSlots, createAppointment } from '../services/api';

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  barbers: Barber[];
  lang: Language;
  preselectedServiceId?: number;
  preselectedBarberId?: number;
  onBookingComplete?: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  isOpen,
  onClose,
  services,
  barbers,
  lang,
  preselectedServiceId,
  preselectedBarberId,
  onBookingComplete,
}) => {
  // Wizard Steps: 1=Service, 2=Barber, 3=DateTime, 4=Info, 5=Confirmation
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<number>(0); // 0 = Any barber
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(true);

  // Async slot state
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Initialize preselected props
  useEffect(() => {
    if (preselectedServiceId) {
      const found = services.find((s) => s.id === preselectedServiceId);
      if (found) setSelectedService(found);
    } else if (services.length > 0 && !selectedService) {
      setSelectedService(services[0]);
    }

    if (preselectedBarberId !== undefined) {
      setSelectedBarberId(preselectedBarberId);
    }
  }, [preselectedServiceId, preselectedBarberId, services]);

  // Load available slots whenever Date, Service, or Barber changes
  useEffect(() => {
    if (selectedService && selectedDate) {
      setLoadingSlots(true);
      setErrorMsg(null);
      fetchAvailableSlots(selectedDate, selectedService.id, selectedBarberId)
        .then((fetchedSlots) => {
          setSlots(fetchedSlots);
          // Reset selected time if current time is not available
          if (selectedTime && !fetchedSlots.some((s) => s.time === selectedTime && s.available)) {
            setSelectedTime('');
          }
        })
        .catch((err) => {
          console.error(err);
          setErrorMsg('Errore nel caricamento degli orari.');
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, selectedService, selectedBarberId]);

  if (!isOpen) return null;

  // Handle final submission
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedTime || !selectedDate) return;
    if (!customerName || !customerPhone || !customerEmail) {
      setErrorMsg('Compila tutti i campi obbligatori.');
      return;
    }
    if (!privacyAgreed) {
      setErrorMsg('È necessario accettare l\'informativa sulla privacy per procedere.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await createAppointment({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        service_id: selectedService.id,
        barber_id: selectedBarberId,
        appointment_date: selectedDate,
        start_time: selectedTime,
        notes,
      });

      setConfirmedAppointment(result.appointment);
      setStep(5); // Confirmation screen
      if (onBookingComplete) onBookingComplete();
    } catch (err: any) {
      setErrorMsg(err.message || t(lang, 'booking.overlap_error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Generate iCal Calendar File Download (.ics)
  const downloadIcalFile = () => {
    if (!confirmedAppointment || !selectedService) return;

    const startIso = `${confirmedAppointment.appointment_date.replace(/-/g, '')}T${confirmedAppointment.start_time.replace(':', '')}00`;
    const endIso = `${confirmedAppointment.appointment_date.replace(/-/g, '')}T${confirmedAppointment.end_time.replace(':', '')}00`;

    const barberName = confirmedAppointment.barber?.name || 'Barberia Elite';

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Barberia Elite Milano//Booking System//IT
BEGIN:VEVENT
UID:${confirmedAppointment.booking_code}@barberia-elite.it
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startIso}
DTEND:${endIso}
SUMMARY:Appuntamento Barberia Elite - ${selectedService.name_it}
DESCRIPTION:Appuntamento confermato per ${confirmedAppointment.customer_name}. Barber: ${barberName}. Codice: ${confirmedAppointment.booking_code}
LOCATION:Via Montenapoleone 14, 20121 Milano MI
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `appuntamento-${confirmedAppointment.booking_code}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate WhatsApp confirmation URL
  const getWhatsappUrl = () => {
    if (!confirmedAppointment) return '#';
    const text = encodeURIComponent(
      `Ciao Barberia Elite! Ho prenotato un appuntamento. Codice: ${confirmedAppointment.booking_code}, Data: ${confirmedAppointment.appointment_date} ore ${confirmedAppointment.start_time}. Nome: ${confirmedAppointment.customer_name}.`
    );
    return `https://wa.me/39021234567?text=${text}`;
  };

  const selectedBarberObj = barbers.find((b) => b.id === selectedBarberId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#111111] border border-stone-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-stone-800 bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-600 rotate-45 flex items-center justify-center shrink-0">
              <Scissors className="w-4 h-4 text-amber-500 -rotate-45" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                {t(lang, 'booking.title')}
              </h3>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">
                {t(lang, 'booking.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Immersive Step Indicator Bar */}
        {step < 5 && (
          <div className="bg-[#0A0A0A] px-6 py-4 border-b border-stone-800">
            <div className="flex justify-between items-center mb-2 text-[10px] uppercase font-bold tracking-widest text-stone-500">
              <span>{t(lang, `booking.step${step}` as any)}</span>
              <span>Step {step} di 4</span>
            </div>
            <div className="flex gap-1.5 h-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-full flex-1 transition-all ${
                    i <= step ? 'bg-amber-600' : 'bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="m-6 mb-0 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <div className="leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          
          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div>
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-4">
                {t(lang, 'booking.select_service')}
              </p>

              <div className="grid grid-cols-1 gap-3">
                {services.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  const name = service[`name_${lang}` as keyof Service] as string || service.name_it;
                  const desc = service[`description_${lang}` as keyof Service] as string || service.description_it;

                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`group cursor-pointer p-4 flex justify-between items-center transition-all ${
                        isSelected
                          ? 'bg-amber-600/10 border border-amber-600/50'
                          : 'bg-stone-900 hover:bg-stone-800 border border-stone-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-amber-600 text-black' : 'border border-stone-600'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{name}</p>
                          <p className="text-[11px] text-stone-400 mt-0.5 max-w-md">{desc}</p>
                          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mt-1">
                            {service.duration_minutes} minuti
                          </p>
                        </div>
                      </div>

                      <span className="text-amber-500 font-bold text-base shrink-0">
                        €{service.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: BARBER SELECTION */}
          {step === 2 && (
            <div>
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-4">
                {t(lang, 'booking.select_barber')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Any Barber Option */}
                <div
                  onClick={() => setSelectedBarberId(0)}
                  className={`cursor-pointer p-4 transition-all flex items-center gap-3 ${
                    selectedBarberId === 0
                      ? 'bg-amber-600/10 border border-amber-600/50'
                      : 'bg-stone-900 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  <div className="w-10 h-10 bg-amber-600/20 border border-amber-600/40 flex items-center justify-center text-amber-500 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white uppercase">
                      {t(lang, 'barbers.any_barber')}
                    </h5>
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                      Massima Disponibilità
                    </span>
                  </div>
                </div>

                {/* Specific Barbers */}
                {barbers.map((barber) => {
                  const isSelected = selectedBarberId === barber.id;
                  const specialty = barber[`specialty_${lang}` as keyof Barber] as string || barber.specialty_it;

                  return (
                    <div
                      key={barber.id}
                      onClick={() => setSelectedBarberId(barber.id)}
                      className={`cursor-pointer p-4 transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-amber-600/10 border border-amber-600/50'
                          : 'bg-stone-900 hover:bg-stone-800 border border-stone-800'
                      }`}
                    >
                      <img
                        src={barber.photo_url}
                        alt={barber.name}
                        className="w-10 h-10 object-cover shrink-0 grayscale"
                      />
                      <div>
                        <h5 className="text-sm font-bold text-white">{barber.name}</h5>
                        <p className="text-[10px] text-amber-500 uppercase tracking-wider">{specialty}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: DATE & TIME */}
          {step === 3 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    {t(lang, 'booking.select_date')} & Orario
                  </p>
                </div>

                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 bg-stone-900 border border-stone-800 text-white text-xs font-mono font-bold outline-none cursor-pointer"
                />
              </div>

              {/* Time Slots Grid */}
              {loadingSlots ? (
                <div className="py-12 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  <span>Calcolo disponibilità orari...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="py-8 text-center bg-stone-900 border border-stone-800 p-6">
                  <p className="text-xs text-stone-400">
                    {t(lang, 'booking.no_slots')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedTime === slot.time;

                    return (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-3 text-xs font-mono font-bold transition-all cursor-pointer ${
                          !slot.available
                            ? 'bg-stone-950 text-stone-700 border border-stone-900 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-amber-600 text-black font-bold border border-amber-600'
                            : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-amber-600/50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CUSTOMER DETAILS */}
          {step === 4 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                {t(lang, 'booking.customer_info')}
              </p>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  {t(lang, 'booking.name')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Mario Rossi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-900 border border-stone-800 text-white text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                    {t(lang, 'booking.phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+39 340 1234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-900 border border-stone-800 text-white text-xs outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                    {t(lang, 'booking.email')} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="mario.rossi@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-900 border border-stone-800 text-white text-xs outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  {t(lang, 'booking.notes')}
                </label>
                <textarea
                  rows={2}
                  placeholder="Note aggiuntive..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-900 border border-stone-800 text-white text-xs outline-none focus:border-amber-600 resize-none"
                />
              </div>

              {/* GDPR Agreement Checkbox */}
              <label className="flex items-start gap-3 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="mt-0.5 accent-amber-600"
                />
                <span className="text-[11px] text-stone-400">
                  {t(lang, 'booking.privacy_agree')}
                </span>
              </label>
            </form>
          )}

          {/* STEP 5: CONFIRMATION SUCCESS VIEW */}
          {step === 5 && confirmedAppointment && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-amber-600/10 border border-amber-600/40 text-amber-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-2xl font-serif font-bold text-white mb-2">
                  {t(lang, 'confirm.success_title')}
                </h4>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  {t(lang, 'confirm.success_subtitle')}
                </p>
              </div>

              <div className="inline-block px-8 py-3 bg-stone-900 border border-amber-600/50">
                <span className="text-[10px] text-stone-500 block uppercase tracking-widest mb-1">
                  {t(lang, 'confirm.booking_code')}
                </span>
                <span className="text-2xl font-mono font-bold text-amber-500">
                  {confirmedAppointment.booking_code}
                </span>
              </div>

              <div className="max-w-md mx-auto bg-stone-900 p-5 border border-stone-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500 uppercase text-[10px] tracking-wider">{t(lang, 'confirm.summary_service')}</span>
                  <span className="font-bold text-white">{confirmedAppointment.service?.name_it}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 uppercase text-[10px] tracking-wider">{t(lang, 'confirm.summary_barber')}</span>
                  <span className="font-bold text-white">{confirmedAppointment.barber?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 uppercase text-[10px] tracking-wider">{t(lang, 'confirm.summary_datetime')}</span>
                  <span className="font-bold text-amber-500 font-mono">
                    {confirmedAppointment.appointment_date} @ {confirmedAppointment.start_time} - {confirmedAppointment.end_time}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={downloadIcalFile}
                  className="w-full sm:w-auto px-6 py-3.5 bg-stone-900 border border-stone-800 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Download className="w-4 h-4 text-amber-500" />
                  <span>{t(lang, 'confirm.add_calendar')}</span>
                </button>

                <a
                  href={getWhatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t(lang, 'confirm.whatsapp_share')}</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Modal Navigation Footer */}
        {step < 5 && (
          <div className="p-6 bg-stone-900/50 border-t border-stone-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 bg-stone-900 border border-stone-800 text-xs font-bold text-stone-300 uppercase tracking-wider cursor-pointer"
              >
                {t(lang, 'booking.btn_back')}
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                disabled={
                  (step === 1 && !selectedService) ||
                  (step === 3 && !selectedTime)
                }
                onClick={() => setStep(step + 1)}
                className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-[11px] tracking-[0.2em] transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t(lang, 'booking.btn_next')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-[11px] tracking-[0.2em] cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Elaborazione...' : t(lang, 'booking.btn_confirm')}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
