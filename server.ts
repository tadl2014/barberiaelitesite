import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SERVICES, INITIAL_BARBERS, INITIAL_APPOINTMENTS } from './src/data/initialData.ts';
import { Appointment, Service, Barber, TimeSlot } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory Database state
let servicesStore: Service[] = [...INITIAL_SERVICES];
let barbersStore: Barber[] = [...INITIAL_BARBERS];
let appointmentsStore: Appointment[] = [...INITIAL_APPOINTMENTS];
let nextAppointmentId = 201;

// Time helper functions
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all Services
  app.get('/api/services', (req, res) => {
    res.json(servicesStore);
  });

  // Get all Barbers
  app.get('/api/barbers', (req, res) => {
    res.json(barbersStore);
  });

  // Get all Appointments (with optional filters)
  app.get('/api/appointments', (req, res) => {
    const { date, barber_id, search } = req.query;
    let list = [...appointmentsStore];

    if (date) {
      list = list.filter((a) => a.appointment_date === date);
    }

    if (barber_id && Number(barber_id) !== 0) {
      list = list.filter((a) => a.barber_id === Number(barber_id));
    }

    if (search) {
      const query = String(search).toLowerCase();
      list = list.filter(
        (a) =>
          a.booking_code.toLowerCase().includes(query) ||
          a.customer_name.toLowerCase().includes(query) ||
          a.customer_email.toLowerCase().includes(query) ||
          a.customer_phone.includes(query)
      );
    }

    // Hydrate
    const hydrated = list.map((a) => ({
      ...a,
      service: servicesStore.find((s) => s.id === a.service_id),
      barber: barbersStore.find((b) => b.id === a.barber_id),
    }));

    res.json(hydrated);
  });

  // Anti-Overlap Slot Generator API
  app.get('/api/available-slots', (req, res) => {
    const { date, service_id, barber_id } = req.query;

    if (!date || !service_id) {
      return res.status(400).json({ error: 'Missing required query params: date, service_id' });
    }

    const service = servicesStore.find((s) => s.id === Number(service_id));
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const requestedBarberId = Number(barber_id) || 0;
    const duration = service.duration_minutes;

    // Filter target active barbers
    let targetBarbers = barbersStore.filter((b) => b.is_active);
    if (requestedBarberId > 0) {
      targetBarbers = targetBarbers.filter((b) => b.id === requestedBarberId);
    }

    if (targetBarbers.length === 0) {
      return res.json({ slots: [] });
    }

    // Active non-cancelled appointments for this date
    const dateAppointments = appointmentsStore.filter(
      (a) => a.appointment_date === String(date) && a.status !== 'cancelled'
    );

    const slots: TimeSlot[] = [];
    const shopStartMins = timeToMinutes('09:00');
    const shopEndMins = timeToMinutes('20:00');

    // Generate slots every 30 minutes
    for (let currentMins = shopStartMins; currentMins + duration <= shopEndMins; currentMins += 30) {
      const slotStart = minutesToTime(currentMins);
      const slotEnd = minutesToTime(currentMins + duration);
      const startMins = currentMins;
      const endMins = currentMins + duration;

      let assignedBarberId: number | undefined = undefined;

      // Check if any of the target barbers is free for [startMins, endMins]
      for (const barber of targetBarbers) {
        const hasOverlap = dateAppointments.some((app) => {
          if (app.barber_id !== barber.id) return false;

          const appStartMins = timeToMinutes(app.start_time);
          const appEndMins = timeToMinutes(app.end_time);

          // Overlap condition: startMins < appEndMins AND endMins > appStartMins
          return startMins < appEndMins && endMins > appStartMins;
        });

        if (!hasOverlap) {
          assignedBarberId = barber.id;
          break; // Found free barber!
        }
      }

      slots.push({
        time: slotStart,
        available: assignedBarberId !== undefined,
        assigned_barber_id: assignedBarberId,
      });
    }

    res.json({ slots, service_duration: duration });
  });

  // Create Appointment (with Anti-Overlap Validation)
  app.post('/api/appointments', (req, res) => {
    const {
      customer_name,
      customer_phone,
      customer_email,
      service_id,
      barber_id,
      appointment_date,
      start_time,
      notes,
    } = req.body;

    if (
      !customer_name ||
      !customer_phone ||
      !customer_email ||
      !service_id ||
      !appointment_date ||
      !start_time
    ) {
      return res.status(400).json({ error: 'Missing required appointment fields.' });
    }

    const service = servicesStore.find((s) => s.id === Number(service_id));
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const startMins = timeToMinutes(start_time);
    const endMins = startMins + service.duration_minutes;
    const endTimeStr = minutesToTime(endMins);

    let assignedBarberId = Number(barber_id) || 0;

    // Active barbers
    const activeBarbers = barbersStore.filter((b) => b.is_active);

    if (assignedBarberId === 0) {
      // Find first available barber
      for (const barber of activeBarbers) {
        const isOverlap = appointmentsStore.some((a) => {
          if (a.appointment_date !== appointment_date || a.status === 'cancelled') return false;
          if (a.barber_id !== barber.id) return false;

          const aStart = timeToMinutes(a.start_time);
          const aEnd = timeToMinutes(a.end_time);

          return startMins < aEnd && endMins > aStart;
        });

        if (!isOverlap) {
          assignedBarberId = barber.id;
          break;
        }
      }

      if (assignedBarberId === 0) {
        return res
          .status(422)
          .json({ error: 'Nessun barber disponibile per questo orario. Scegli un altro slot.' });
      }
    } else {
      // Check explicit overlap for chosen barber
      const targetBarber = activeBarbers.find((b) => b.id === assignedBarberId);
      if (!targetBarber) {
        return res.status(404).json({ error: 'Barber non trovato o non attivo.' });
      }

      const isOverlap = appointmentsStore.some((a) => {
        if (a.appointment_date !== appointment_date || a.status === 'cancelled') return false;
        if (a.barber_id !== assignedBarberId) return false;

        const aStart = timeToMinutes(a.start_time);
        const aEnd = timeToMinutes(a.end_time);

        return startMins < aEnd && endMins > aStart;
      });

      if (isOverlap) {
        return res.status(422).json({
          error: 'L\'orario selezionato si sovrappone ad un altro appuntamento già confermato.',
        });
      }
    }

    // Generate random booking code
    const randomCode =
      'BE-' + Math.floor(1000 + Math.random() * 9000).toString();

    const newAppointment: Appointment = {
      id: nextAppointmentId++,
      booking_code: randomCode,
      customer_name,
      customer_phone,
      customer_email,
      service_id: Number(service_id),
      barber_id: assignedBarberId,
      appointment_date,
      start_time,
      end_time: endTimeStr,
      status: 'confirmed',
      notes: notes || '',
      created_at: new Date().toISOString(),
      service,
      barber: barbersStore.find((b) => b.id === assignedBarberId),
    };

    appointmentsStore.unshift(newAppointment);

    res.status(201).json({
      message: 'Prenotazione confermata con successo!',
      appointment: newAppointment,
    });
  });

  // Update appointment status
  app.patch('/api/appointments/:id/status', (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    const appointment = appointmentsStore.find((a) => a.id === id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    appointment.status = status;
    res.json(appointment);
  });

  // Toggle barber active status
  app.patch('/api/barbers/:id/toggle', (req, res) => {
    const id = Number(req.params.id);
    const barber = barbersStore.find((b) => b.id === id);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    barber.is_active = !barber.is_active;
    res.json(barber);
  });

  // Reset Demo Data
  app.post('/api/reset-data', (req, res) => {
    servicesStore = [...INITIAL_SERVICES];
    barbersStore = [...INITIAL_BARBERS];
    appointmentsStore = [...INITIAL_APPOINTMENTS];
    nextAppointmentId = 201;
    res.json({ message: 'Demo data reset successfully.' });
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
