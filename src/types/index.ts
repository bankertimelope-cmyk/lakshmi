export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface DaySchedule {
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "18:30"
}

export type BusinessHours = Record<DayOfWeek, DaySchedule>;

export interface BlockedDate {
  id: string;
  date: string; // "YYYY-MM-DD"
  reason: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  legalName: string;
  category: string;
  description: string;
  shortTagline: string;
  address: {
    street: string;
    suburb: string;
    city: string;
    district: string;
    state: string;
    postalCode: string;
    country: string;
    formatted: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  phone: string;
  whatsapp: string;
  email: string;
  googleMapsUrl: string;
  placeId: string;
  rating: number;
  reviewCount: number;
  establishedYear: number;
  currency: string;
  timezone: string;
  operatingHours: BusinessHours;
  blockedDates: BlockedDate[];
  bookingSettings: {
    autoConfirm: boolean;
    minNoticeHours: number;
    maxAdvanceDays: number;
    bufferMinutes: number;
    cancellationNoticeHours: number;
    confirmationPolicyText: string;
    cancellationPolicyText: string;
  };
  branding: {
    primaryColor: string;
    accentColor: string;
    logoUrl?: string;
    heroImageUrl?: string;
  };
}

export interface Service {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  durationMinutes: number;
  price: number;
  isPriceFrom?: boolean;
  isFree?: boolean;
  isActive: boolean;
  imageUrl?: string;
  deliverables?: string[];
  maxGroupSize?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  avatarUrl?: string;
  isActive: boolean;
  assignedServiceIds: string[]; // empty means all
}

export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Rejected'
  | 'Cancelled'
  | 'Completed'
  | 'No-show';

export interface Appointment {
  id: string;
  referenceCode: string; // e.g. SLM-4829
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  staffId?: string;
  staffName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour)
  endTime: string; // HH:MM
  durationMinutes: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNotes?: string;
  status: AppointmentStatus;
  internalNotes?: string;
  statusReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  dateAdded: string;
  isHighlight: boolean;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  verifiedSource: string;
  highlightAspect: string;
}

export interface NotificationLog {
  id: string;
  appointmentId: string;
  referenceCode: string;
  recipientType: 'Customer' | 'Business';
  channel: 'WhatsApp' | 'Email' | 'SMS';
  event: string;
  recipient: string;
  message: string;
  status: 'Delivered' | 'Queued' | 'Simulated' | 'Failed';
  timestamp: string;
  details?: string;
}

export interface AvailableTimeSlot {
  time: string; // "09:00"
  displayTime: string; // "09:00 AM"
  available: boolean;
  reason?: string;
}
