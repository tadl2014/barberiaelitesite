import { LaravelFile } from '../types';

export const LARAVEL_CODEBASE: LaravelFile[] = [
  {
    filename: '2026_01_01_000001_create_services_table.php',
    path: 'database/migrations/2026_01_01_000001_create_services_table.php',
    language: 'php',
    content: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name_it');
            $table->string('name_en');
            $table->string('name_fr');
            $table->decimal('price', 8, 2);
            $table->integer('duration_minutes')->default(30);
            $table->text('description_it')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_fr')->nullable();
            $table->enum('category', ['hair', 'beard', 'combo', 'treatment'])->default('hair');
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};`,
  },
  {
    filename: '2026_01_01_000002_create_barbers_table.php',
    path: 'database/migrations/2026_01_01_000002_create_barbers_table.php',
    language: 'php',
    content: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barbers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('photo_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('bio_it')->nullable();
            $table->text('bio_en')->nullable();
            $table->text('bio_fr')->nullable();
            $table->string('specialty_it')->nullable();
            $table->string('specialty_en')->nullable();
            $table->string('specialty_fr')->nullable();
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('reviews_count')->default(0);
            $table->time('working_start')->default('09:00:00');
            $table->time('working_end')->default('20:00:00');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barbers');
    }
};`,
  },
  {
    filename: '2026_01_01_000003_create_appointments_table.php',
    path: 'database/migrations/2026_01_01_000003_create_appointments_table.php',
    language: 'php',
    content: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email');
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->foreignId('barber_id')->nullable()->constrained('barbers')->onDelete('cascade');
            $table->date('appointment_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['confirmed', 'completed', 'cancelled'])->default('confirmed');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Index for fast anti-overlap checks
            $table->index(['barber_id', 'appointment_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};`,
  },
  {
    filename: 'Service.php',
    path: 'app/Models/Service.php',
    language: 'php',
    content: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_it', 'name_en', 'name_fr',
        'price', 'duration_minutes',
        'description_it', 'description_en', 'description_fr',
        'category', 'image_url', 'is_active'
    ];

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function getNameAttribute()
    {
        $locale = app()->getLocale();
        return $this->{"name_{$locale}"} ?? $this->name_it;
    }

    public function getDescriptionAttribute()
    {
        $locale = app()->getLocale();
        return $this->{"description_{$locale}"} ?? $this->description_it;
    }
}`,
  },
  {
    filename: 'Barber.php',
    path: 'app/Models/Barber.php',
    language: 'php',
    content: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class Barber extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'photo_url', 'is_active',
        'bio_it', 'bio_en', 'bio_fr',
        'specialty_it', 'specialty_en', 'specialty_fr',
        'rating', 'reviews_count', 'working_start', 'working_end'
    ];

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function getBioAttribute()
    {
        $locale = app()->getLocale();
        return $this->{"bio_{$locale}"} ?? $this->bio_it;
    }

    public function getSpecialtyAttribute()
    {
        $locale = app()->getLocale();
        return $this->{"specialty_{$locale}"} ?? $this->specialty_it;
    }
}`,
  },
  {
    filename: 'Appointment.php',
    path: 'app/Models/Appointment.php',
    language: 'php',
    content: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'customer_name',
        'customer_phone',
        'customer_email',
        'service_id',
        'barber_id',
        'appointment_date',
        'start_time',
        'end_time',
        'status',
        'notes'
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function barber()
    {
        return $this->belongsTo(Barber::class);
    }
}`,
  },
  {
    filename: 'BookingController.php',
    path: 'app/Http/Controllers/BookingController.php',
    language: 'php',
    content: `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Appointment;
use App\\Models\\Barber;
use App\\Models\\Service;
use Carbon\\Carbon;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Str;

class BookingController extends Controller
{
    /**
     * Calculate available time slots for a specific date, barber, and service.
     * Prevents overlapping appointments (Anti-Overlap System).
     */
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'date' => 'required|date_format:Y-m-d',
            'service_id' => 'required|exists:services,id',
            'barber_id' => 'nullable|integer',
        ]);

        $date = $request->date;
        $service = Service::findOrFail($request->service_id);
        $requestedBarberId = $request->barber_id;
        $durationMinutes = $service->duration_minutes;

        // Active barbers
        $barbers = Barber::where('is_active', true)->get();
        if ($requestedBarberId && $requestedBarberId > 0) {
            $barbers = $barbers->where('id', $requestedBarberId);
        }

        // Generate 30-min interval potential slots between 09:00 and 19:30
        $slots = [];
        $startTime = Carbon::createFromFormat('Y-m-d H:i', "{$date} 09:00");
        $endTime = Carbon::createFromFormat('Y-m-d H:i', "{$date} 19:30");

        while ($startTime->lt($endTime)) {
            $slotStart = $startTime->format('H:i');
            $slotEnd = $startTime->copy()->addMinutes($durationMinutes)->format('H:i');

            // Skip if slot end time exceeds shop closing hours (20:00)
            if ($startTime->copy()->addMinutes($durationMinutes)->gt(Carbon::createFromFormat('Y-m-d H:i', "{$date} 20:00"))) {
                $startTime->addMinutes(30);
                continue;
            }

            // Check if any barber is free during [$slotStart, $slotEnd]
            $availableBarberId = null;

            foreach ($barbers as $barber) {
                $isOverlap = Appointment::where('barber_id', $barber->id)
                    ->where('appointment_date', $date)
                    ->where('status', '!=', 'cancelled')
                    ->where(function ($query) use ($slotStart, $slotEnd) {
                        // Anti-Overlap Condition: (StartA < EndB) AND (EndA > StartB)
                        $query->where('start_time', '<', $slotEnd)
                              ->where('end_time', '>', $slotStart);
                    })->exists();

                if (!$isOverlap) {
                    $availableBarberId = $barber->id;
                    break; // Found free barber for this slot
                }
            }

            $slots[] = [
                'time' => $slotStart,
                'available' => $availableBarberId !== null,
                'assigned_barber_id' => $availableBarberId,
            ];

            $startTime->addMinutes(30);
        }

        return response()->json(['slots' => $slots]);
    }

    /**
     * Store new appointment with strict anti-overlap verification.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'customer_email' => 'required|email|max:255',
            'service_id' => 'required|exists:services,id',
            'barber_id' => 'required|integer',
            'appointment_date' => 'required|date_format:Y-m-d',
            'start_time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:1000',
        ]);

        $service = Service::findOrFail($validated['service_id']);
        $start = Carbon::createFromFormat('H:i', $validated['start_time']);
        $end = $start->copy()->addMinutes($service->duration_minutes);
        $startTimeStr = $start->format('H:i');
        $endTimeStr = $end->format('H:i');

        $barberId = $validated['barber_id'];

        // If 'Any Barber' chosen ($barberId == 0), assign first available
        if ($barberId == 0) {
            $activeBarbers = Barber::where('is_active', true)->get();
            foreach ($activeBarbers as $barber) {
                $overlap = Appointment::where('barber_id', $barber->id)
                    ->where('appointment_date', $validated['appointment_date'])
                    ->where('status', '!=', 'cancelled')
                    ->where(function ($q) use ($startTimeStr, $endTimeStr) {
                        $q->where('start_time', '<', $endTimeStr)
                          ->where('end_time', '>', $startTimeStr);
                    })->exists();

                if (!$overlap) {
                    $barberId = $barber->id;
                    break;
                }
            }

            if ($barberId == 0) {
                return response()->json([
                    'message' => __('messages.overlap_error')
                ], 422);
            }
        } else {
            // Check explicit overlap for chosen barber
            $overlap = Appointment::where('barber_id', $barberId)
                ->where('appointment_date', $validated['appointment_date'])
                ->where('status', '!=', 'cancelled')
                ->where(function ($q) use ($startTimeStr, $endTimeStr) {
                    $q->where('start_time', '<', $endTimeStr)
                      ->where('end_time', '>', $startTimeStr);
                })->exists();

            if ($overlap) {
                return response()->json([
                    'message' => __('messages.overlap_error')
                ], 422);
            }
        }

        $bookingCode = 'BE-' . strtoupper(Str::random(5));

        $appointment = Appointment::create([
            'booking_code' => $bookingCode,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_email' => $validated['customer_email'],
            'service_id' => $validated['service_id'],
            'barber_id' => $barberId,
            'appointment_date' => $validated['appointment_date'],
            'start_time' => $startTimeStr,
            'end_time' => $endTimeStr,
            'status' => 'confirmed',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => __('messages.confirm.success_title'),
            'appointment' => $appointment->load(['service', 'barber']),
        ], 201);
    }
}`,
  },
  {
    filename: 'lang_it_messages.php',
    path: 'lang/it/messages.php',
    language: 'php',
    content: `<?php

return [
    'welcome' => 'Benvenuto da Barberia Elite Milano',
    'book_now' => 'PRENOTA ORA',
    'select_service' => 'Seleziona un Servizio',
    'select_barber' => 'Scegli il tuo Barber',
    'overlap_error' => 'Siamo spiacenti! L\'orario selezionato si sovrappone a un altro appuntamento già confermato.',
    'confirm' => [
        'success_title' => 'Prenotazione Confermata con Successo!',
        'booking_code' => 'Codice Prenotazione:',
    ],
];`,
  },
  {
    filename: 'lang_en_messages.php',
    path: 'lang/en/messages.php',
    language: 'php',
    content: `<?php

return [
    'welcome' => 'Welcome to Barberia Elite Milan',
    'book_now' => 'BOOK NOW',
    'select_service' => 'Choose a Service',
    'select_barber' => 'Select your Barber',
    'overlap_error' => 'Sorry! The selected time slot overlaps with an existing appointment for this barber.',
    'confirm' => [
        'success_title' => 'Booking Successfully Confirmed!',
        'booking_code' => 'Booking Reference Code:',
    ],
];`,
  },
  {
    filename: 'lang_fr_messages.php',
    path: 'lang/fr/messages.php',
    language: 'php',
    content: `<?php

return [
    'welcome' => 'Bienvenue chez Barberia Elite Milan',
    'book_now' => 'RÉSERVER',
    'select_service' => 'Sélectionnez un Service',
    'select_barber' => 'Choisissez votre Barbier',
    'overlap_error' => 'Désolé! Le créneau horaire choisi se chevauche avec un altro rendez-vous.',
    'confirm' => [
        'success_title' => 'Réservation Confirmée avec Succès!',
        'booking_code' => 'Code de Réservation:',
    ],
];`,
  },
  {
    filename: 'api.php',
    path: 'routes/api.php',
    language: 'php',
    content: `<?php

use App\\Http\\Controllers\\BookingController;
use Illuminate\\Support\\Facades\\Route;

Route::get('/services', [BookingController::class, 'getServices']);
Route::get('/barbers', [BookingController::class, 'getBarbers']);
Route::get('/available-slots', [BookingController::class, 'getAvailableSlots']);
Route::post('/appointments', [BookingController::class, 'store']);
Route::get('/appointments/search', [BookingController::class, 'search']);
Route::post('/appointments/{id}/cancel', [BookingController::class, 'cancel']);`,
  },
];
