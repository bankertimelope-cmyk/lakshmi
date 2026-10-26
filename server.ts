import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from './server/db.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// In-memory admin sessions token map: token -> { email: string, createdAt: number }
const activeSessions = new Map<string, { email: string; createdAt: number }>();

function generateSessionToken(email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, { email, createdAt: Date.now() });
  return token;
}

// Authentication middleware
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
    return;
  }

  // Session expiry: 7 days
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > SEVEN_DAYS) {
    activeSessions.delete(token);
    res.status(401).json({ error: 'Session expired. Please log in again.' });
    return;
  }

  (req as any).adminEmail = session.email;
  next();
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// 1. Business Profile
app.get('/api/business', async (_req: Request, res: Response) => {
  try {
    const profile = await db.getBusinessProfile();
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch business profile' });
  }
});

// 2. Services
app.get('/api/services', async (_req: Request, res: Response) => {
  try {
    const services = await db.getServices(true);
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch services' });
  }
});

// 3. Staff
app.get('/api/staff', async (_req: Request, res: Response) => {
  try {
    const staff = await db.getStaff(true);
    res.json(staff);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch staff' });
  }
});

// 4. Gallery
app.get('/api/gallery', async (_req: Request, res: Response) => {
  try {
    const gallery = await db.getGallery();
    res.json(gallery);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch gallery' });
  }
});

// 5. Authentic Google Maps Reviews
app.get('/api/reviews', async (_req: Request, res: Response) => {
  try {
    const reviews = await db.getReviews();
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch reviews' });
  }
});

// 6. Time Slot Availability (Server-Side Concurrency-Safe Check)
app.get('/api/availability', async (req: Request, res: Response) => {
  try {
    const { date, serviceId, staffId } = req.query;

    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'Date (YYYY-MM-DD) is required.' });
      return;
    }
    if (!serviceId || typeof serviceId !== 'string') {
      res.status(400).json({ error: 'Service ID is required.' });
      return;
    }

    const result = await db.calculateAvailableSlots({
      date,
      serviceId,
      staffId: typeof staffId === 'string' ? staffId : undefined
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to compute availability' });
  }
});

// 7. Submit New Appointment
app.post('/api/appointments', async (req: Request, res: Response) => {
  try {
    const {
      serviceId,
      staffId,
      date,
      startTime,
      customerName,
      customerPhone,
      customerEmail,
      customerNotes
    } = req.body;

    // Strict validation
    if (!serviceId || !date || !startTime || !customerName || !customerPhone) {
      res.status(400).json({
        error: 'Please fill in all required fields (service, date, time slot, full name, phone number).'
      });
      return;
    }

    // Basic phone validation (at least 10 digits)
    const digitsOnly = customerPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      res.status(400).json({
        error: 'Please provide a valid phone number (at least 10 digits).'
      });
      return;
    }

    const result = await db.createAppointment({
      serviceId,
      staffId,
      date,
      startTime,
      customerName,
      customerPhone,
      customerEmail,
      customerNotes
    });

    if (!result.success) {
      res.status(409).json({ error: result.error });
      return;
    }

    res.status(201).json({
      success: true,
      appointment: result.appointment
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to schedule appointment' });
  }
});

// 8. Public Appointment Lookup by Reference Code
app.get('/api/appointments/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const appointment = await db.getAppointmentByReference(reference);

    if (!appointment) {
      res.status(404).json({ error: 'No appointment found with reference: ' + reference });
      return;
    }

    // Public view only exposes essential non-sensitive info
    res.json({
      referenceCode: appointment.referenceCode,
      serviceName: appointment.serviceName,
      servicePrice: appointment.servicePrice,
      staffName: appointment.staffName,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      durationMinutes: appointment.durationMinutes,
      customerName: appointment.customerName,
      status: appointment.status,
      createdAt: appointment.createdAt
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error looking up appointment' });
  }
});

// 9. Customer Self-Cancel (by reference code and matching phone digits)
app.post('/api/appointments/:reference/cancel', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const { phone } = req.body;

    const appointment = await db.getAppointmentByReference(reference);
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    const appDigits = appointment.customerPhone.replace(/\D/g, '').slice(-10);
    const inDigits = (phone || '').replace(/\D/g, '').slice(-10);

    if (appDigits !== inDigits) {
      res.status(403).json({ error: 'Phone number does not match booking record.' });
      return;
    }

    if (appointment.status === 'Cancelled' || appointment.status === 'Completed') {
      res.status(400).json({ error: `Appointment is already ${appointment.status}.` });
      return;
    }

    const updated = await db.updateAppointmentStatus(appointment.id, {
      status: 'Cancelled',
      statusReason: 'Cancelled by customer via online portal.'
    });

    res.json({ success: true, appointment: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to cancel appointment' });
  }
});

// ==========================================
// ADMIN AUTHENTICATION & MANAGEMENT ROUTES
// ==========================================

// Admin Login
app.post('/api/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const adminEmail = await db.getAdminEmail();

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    if (email.trim().toLowerCase() !== adminEmail.toLowerCase()) {
      res.status(401).json({ error: 'Invalid admin credentials.' });
      return;
    }

    const valid = await db.verifyAdminPassword(password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid admin password.' });
      return;
    }

    const token = generateSessionToken(adminEmail);
    res.json({
      success: true,
      token,
      admin: { email: adminEmail }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login error' });
  }
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// Admin Current User Check
app.get('/api/admin/me', requireAdmin, async (_req: Request, res: Response) => {
  const email = await db.getAdminEmail();
  res.json({ authenticated: true, email });
});

// Admin Change Password
app.post('/api/admin/change-password', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      return;
    }

    const valid = await db.verifyAdminPassword(currentPassword);
    if (!valid) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }

    await db.changeAdminPassword(newPassword);
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update password' });
  }
});

// Admin Business Profile Update
app.put('/api/admin/business', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.updateBusinessProfile(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update business profile' });
  }
});

// Admin Appointments List (with filters & search)
app.get('/api/admin/appointments', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, search, date, serviceId } = req.query;
    const appointments = await db.getAppointments({
      status: typeof status === 'string' ? status : undefined,
      search: typeof search === 'string' ? search : undefined,
      date: typeof date === 'string' ? date : undefined,
      serviceId: typeof serviceId === 'string' ? serviceId : undefined
    });
    res.json(appointments);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch appointments' });
  }
});

// Admin Update Appointment (status, notes, reschedule)
app.put('/api/admin/appointments/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, internalNotes, statusReason, date, startTime, staffId } = req.body;

    const updated = await db.updateAppointmentStatus(id, {
      status,
      internalNotes,
      statusReason,
      date,
      startTime,
      staffId
    });

    if (!updated) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update appointment' });
  }
});

// Admin Services CRUD
app.get('/api/admin/services', requireAdmin, async (_req: Request, res: Response) => {
  const services = await db.getServices(false);
  res.json(services);
});

app.post('/api/admin/services', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await db.saveService(req.body);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save service' });
  }
});

app.put('/api/admin/services/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const saved = await db.saveService({ ...req.body, id });
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update service' });
  }
});

app.delete('/api/admin/services/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await db.deleteService(id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete service' });
  }
});

// Admin Staff CRUD
app.get('/api/admin/staff', requireAdmin, async (_req: Request, res: Response) => {
  const staff = await db.getStaff(false);
  res.json(staff);
});

app.post('/api/admin/staff', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await db.saveStaff(req.body);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save staff' });
  }
});

app.put('/api/admin/staff/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const saved = await db.saveStaff({ ...req.body, id });
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update staff' });
  }
});

app.delete('/api/admin/staff/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await db.deleteStaff(id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete staff' });
  }
});

// Admin Gallery CRUD
app.post('/api/admin/gallery', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await db.saveGalleryItem(req.body);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save gallery item' });
  }
});

app.delete('/api/admin/gallery/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await db.deleteGalleryItem(id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete gallery item' });
  }
});

// Admin Customers Management
app.get('/api/admin/customers', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const customers = await db.getCustomers();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load customers' });
  }
});

// Admin Notifications Log
app.get('/api/admin/notifications', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const notifs = await db.getNotifications();
    res.json(notifs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load notifications' });
  }
});

// Admin CSV Export of Appointments
app.get('/api/admin/export', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const appointments = await db.getAppointments();

    const headers = [
      'Reference Code',
      'Date',
      'Start Time',
      'End Time',
      'Status',
      'Service Name',
      'Price (INR)',
      'Staff Member',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Customer Notes',
      'Internal Notes',
      'Created At'
    ];

    const escapeCsv = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = appointments.map((a) =>
      [
        escapeCsv(a.referenceCode),
        escapeCsv(a.date),
        escapeCsv(a.startTime),
        escapeCsv(a.endTime),
        escapeCsv(a.status),
        escapeCsv(a.serviceName),
        escapeCsv(a.servicePrice),
        escapeCsv(a.staffName || 'Unassigned'),
        escapeCsv(a.customerName),
        escapeCsv(a.customerPhone),
        escapeCsv(a.customerEmail),
        escapeCsv(a.customerNotes || ''),
        escapeCsv(a.internalNotes || ''),
        escapeCsv(a.createdAt)
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=sri_lakshmi_appointments_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to export appointments' });
  }
});

// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================

async function startServer() {
  await db.init();

  if (!isProduction) {
    // Mount Vite middleware in development mode
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
