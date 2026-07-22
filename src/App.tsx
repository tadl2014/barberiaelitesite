import React, { useState, useEffect } from 'react';
import { Language, Service, Barber } from './types';
import { fetchServices, fetchBarbers } from './services/api';
import { SeoHead } from './components/SeoHead';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { BarbersSection } from './components/BarbersSection';
import { BookingWizard } from './components/BookingWizard';
import { ManageBookingModal } from './components/ManageBookingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LaravelExportModal } from './components/LaravelExportModal';
import { GdprBanner } from './components/GdprBanner';
import { Footer } from './components/Footer';

export default function App() {
  const [lang, setLang] = useState<Language>('it');

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [bookingWizardOpen, setBookingWizardOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<number | undefined>(undefined);
  const [preselectedBarberId, setPreselectedBarberId] = useState<number | undefined>(undefined);

  const [manageBookingOpen, setManageBookingOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [laravelModalOpen, setLaravelModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [sData, bData] = await Promise.all([fetchServices(), fetchBarbers()]);
      setServices(sData);
      setBarbers(bData);
    } catch (err) {
      console.error('Failed to load initial barber shop data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Modal Handlers
  const handleOpenBooking = () => {
    setPreselectedServiceId(undefined);
    setPreselectedBarberId(undefined);
    setBookingWizardOpen(true);
  };

  const handleSelectServiceForBooking = (service: Service) => {
    setPreselectedServiceId(service.id);
    setPreselectedBarberId(undefined);
    setBookingWizardOpen(true);
  };

  const handleSelectBarberForBooking = (barberId: number) => {
    setPreselectedBarberId(barberId);
    setPreselectedServiceId(undefined);
    setBookingWizardOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-gray-100 font-sans selection:bg-[#D4AF37] selection:text-black">
      
      {/* Dynamic SEO Meta & Schema.org JSON-LD */}
      <SeoHead lang={lang} />

      {/* Header Bar */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        onOpenBooking={handleOpenBooking}
        onOpenManage={() => setManageBookingOpen(true)}
        onOpenAdmin={() => setAdminDashboardOpen(true)}
        onOpenLaravel={() => setLaravelModalOpen(true)}
      />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero
          lang={lang}
          onOpenBooking={handleOpenBooking}
        />

        {/* Services & Pricing Section */}
        <ServicesSection
          services={services}
          lang={lang}
          onSelectServiceForBooking={handleSelectServiceForBooking}
        />

        {/* Barbers Team Section */}
        <BarbersSection
          barbers={barbers}
          lang={lang}
          onSelectBarberForBooking={handleSelectBarberForBooking}
        />
      </main>

      {/* Footer & Location */}
      <Footer
        lang={lang}
        onOpenBooking={handleOpenBooking}
      />

      {/* Booking Wizard Modal */}
      <BookingWizard
        isOpen={bookingWizardOpen}
        onClose={() => setBookingWizardOpen(false)}
        services={services}
        barbers={barbers}
        lang={lang}
        preselectedServiceId={preselectedServiceId}
        preselectedBarberId={preselectedBarberId}
      />

      {/* Manage Booking Modal */}
      <ManageBookingModal
        isOpen={manageBookingOpen}
        onClose={() => setManageBookingOpen(false)}
        lang={lang}
      />

      {/* Admin Staff Dashboard */}
      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
        barbers={barbers}
        services={services}
        lang={lang}
        onRefreshData={loadData}
      />

      {/* Laravel Code Base Export Drawer */}
      <LaravelExportModal
        isOpen={laravelModalOpen}
        onClose={() => setLaravelModalOpen(false)}
      />

      {/* GDPR Cookie Consent Banner */}
      <GdprBanner lang={lang} />

    </div>
  );
}
