export type Language = 'it' | 'en' | 'fr' | 'ar';

export interface Service {
  id: number;
  name_it: string;
  name_en: string;
  name_fr: string;
  name_ar?: string;
  price: number;
  duration_minutes: number;
  description_it: string;
  description_en: string;
  description_fr: string;
  description_ar?: string;
  category: 'hair' | 'beard' | 'combo' | 'treatment';
  image_url?: string;
  popular?: boolean;
}

export interface Barber {
  id: number;
  name: string;
  photo_url: string;
  is_active: boolean;
  bio_it: string;
  bio_en: string;
  bio_fr: string;
  bio_ar?: string;
  specialty_it: string;
  specialty_en: string;
  specialty_fr: string;
  specialty_ar?: string;
  rating: number;
  reviews_count: number;
  working_hours?: {
    start: string; // "09:00"
    end: string;   // "19:30"
  };
}

export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: number;
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_id: number;
  barber_id: number; // 0 means "Any available barber"
  appointment_date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:mm" e.g. "10:30"
  end_time: string;   // "HH:mm" calculated based on service duration
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  // Hydrated properties for display
  service?: Service;
  barber?: Barber;
}

export interface TimeSlot {
  time: string; // "10:30"
  available: boolean;
  reason?: string;
  assigned_barber_id?: number;
}

export interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  acceptedAt?: string;
}

export interface LaravelFile {
  filename: string;
  path: string;
  language: string;
  content: string;
}
