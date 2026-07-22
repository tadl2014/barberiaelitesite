import { Service, Barber, Appointment, TimeSlot } from '../types';

export async function fetchServices(): Promise<Service[]> {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
}

export async function fetchBarbers(): Promise<Barber[]> {
  const res = await fetch('/api/barbers');
  if (!res.ok) throw new Error('Failed to fetch barbers');
  return res.json();
}

export async function fetchAppointments(
  date?: string,
  barber_id?: number,
  search?: string
): Promise<Appointment[]> {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (barber_id !== undefined && barber_id !== 0) params.append('barber_id', String(barber_id));
  if (search) params.append('search', search);

  const res = await fetch(`/api/appointments?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function fetchAvailableSlots(
  date: string,
  service_id: number,
  barber_id: number = 0
): Promise<TimeSlot[]> {
  const params = new URLSearchParams({
    date,
    service_id: String(service_id),
    barber_id: String(barber_id),
  });

  const res = await fetch(`/api/available-slots?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch available slots');
  const data = await res.json();
  return data.slots || [];
}

export async function createAppointment(data: {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_id: number;
  barber_id: number;
  appointment_date: string;
  start_time: string;
  notes?: string;
}): Promise<{ message: string; appointment: Appointment }> {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to create appointment');
  }
  return body;
}

export async function updateAppointmentStatus(
  id: number,
  status: 'confirmed' | 'completed' | 'cancelled'
): Promise<Appointment> {
  const res = await fetch(`/api/appointments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function toggleBarberActive(id: number): Promise<Barber> {
  const res = await fetch(`/api/barbers/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to toggle barber status');
  return res.json();
}

export async function resetDemoData(): Promise<void> {
  const res = await fetch('/api/reset-data', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset data');
}
