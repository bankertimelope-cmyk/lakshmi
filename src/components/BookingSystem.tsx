import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldAlert,
  Share2,
  CalendarPlus
} from 'lucide-react';
import type {
  Service,
  StaffMember,
  BusinessProfile,
  AvailableTimeSlot,
  Appointment
} from '../types/index.ts';
import { api } from '../services/api.ts';

interface BookingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedServiceId?: string;
  services: Service[];
  staff: StaffMember[];
  business: BusinessProfile | null;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({
  isOpen,
  onClose,
  preSelectedServiceId,
  services,
  staff,
  business
}) => {
  const [step, setStep] = useState<number>(1);

  // Form states
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Customer form fields
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Slots fetching state
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
  const [availabilityReason, setAvailabilityReason] = useState<string | undefined>();

  // Submission state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Calendar month state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Initialize service when opened or changed
  useEffect(() => {
    if (preSelectedServiceId) {
      setSelectedServiceId(preSelectedServiceId);
      // Auto move to date/staff if service was pre-selected from card
      setStep(2);
    } else if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [preSelectedServiceId, services, isOpen]);

  // Fetch slots whenever date, service, or staff changes
  useEffect(() => {
    if (!selectedDate || !selectedServiceId) return;

    let isMounted = true;
    setSlotsLoading(true);
    setAvailabilityReason(undefined);
    setSelectedSlot('');

    api
      .getAvailability({
        date: selectedDate,
        serviceId: selectedServiceId,
        staffId: selectedStaffId !== 'any' ? selectedStaffId : undefined
      })
      .then((res) => {
        if (!isMounted) return;
        setAvailableSlots(res.slots || []);
        setAvailabilityReason(res.reason);
      })
      .catch((err) => {
        if (!isMounted) return;
        setSubmitError(err.message || 'Failed to fetch available time slots.');
      })
      .finally(() => {
        if (isMounted) setSlotsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedServiceId, selectedStaffId]);

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId);
  const currentStaff = staff.find((st) => st.id === selectedStaffId);

  // Calendar date calculations
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const maxAdvanceDays = business?.bookingSettings?.maxAdvanceDays || 30;
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setStep(4);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedDate || !selectedSlot || !customerName || !customerPhone) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.createAppointment({
        serviceId: selectedServiceId,
        staffId: selectedStaffId !== 'any' ? selectedStaffId : undefined,
        date: selectedDate,
        startTime: selectedSlot,
        customerName,
        customerPhone,
        customerEmail,
        customerNotes
      });

      setConfirmedBooking(res.appointment);
      setStep(8); // Confirmation step
    } catch (err: any) {
      setSubmitError(err.message || 'Unable to schedule appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedDate('');
    setSelectedSlot('');
    setConfirmedBooking(null);
    setSubmitError(null);
  };

  // Calendar render helpers
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAFAF7]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Sri Lakshmi Mushrooms & Agrobusiness
            </span>
            <h3 className="font-display font-bold text-lg text-stone-900">
              {step === 8 ? 'Appointment Status' : 'Schedule Your Appointment'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-800 rounded-md hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress bar (if not completed) */}
        {step < 8 && (
          <div className="px-6 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-medium text-stone-500 overflow-x-auto">
            <span className={step >= 1 ? 'text-emerald-800 font-bold' : ''}>1. Service</span>
            <span className="text-stone-300">›</span>
            <span className={step >= 2 ? 'text-emerald-800 font-bold' : ''}>2. Specialist</span>
            <span className="text-stone-300">›</span>
            <span className={step >= 3 ? 'text-emerald-800 font-bold' : ''}>3. Date</span>
            <span className="text-stone-300">›</span>
            <span className={step >= 4 ? 'text-emerald-800 font-bold' : ''}>4. Time</span>
            <span className="text-stone-300">›</span>
            <span className={step >= 5 ? 'text-emerald-800 font-bold' : ''}>5. Details</span>
            <span className="text-stone-300">›</span>
            <span className={step >= 6 ? 'text-emerald-800 font-bold' : ''}>6. Review</span>
          </div>
        )}

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {submitError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold">Booking Notice</p>
                <p>{submitError}</p>
              </div>
            </div>
          )}

          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-stone-900 text-base">Select a Service or Workshop</h4>
                <p className="text-xs text-stone-500">Choose the visit, training, or agro-consulting program you wish to book.</p>
              </div>

              <div className="space-y-3">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => {
                      setSelectedServiceId(srv.id);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      selectedServiceId === srv.id
                        ? 'border-emerald-800 bg-emerald-50/40 shadow-xs'
                        : 'border-stone-200 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                          {srv.category}
                        </span>
                        <span className="text-xs text-stone-400">·</span>
                        <span className="text-xs text-stone-500 tabular-nums">{srv.durationMinutes} mins</span>
                      </div>
                      <h5 className="font-bold text-sm sm:text-base text-stone-900">{srv.name}</h5>
                      <p className="text-xs text-stone-600 line-clamp-2">{srv.shortDescription}</p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs text-stone-500 block">Fee</span>
                      <span className="text-base font-bold text-stone-900 tabular-nums">
                        {srv.isFree ? 'Free Consultation' : `₹${srv.price.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={!selectedServiceId}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <span>Continue to Specialist</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Staff Member */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-base">Select Specialist or Guide</h4>
                  <p className="text-xs text-stone-500">Choose a specific agronomist or select any available specialist.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Change Service
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedStaffId('any')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedStaffId === 'any'
                      ? 'border-emerald-800 bg-emerald-50/40 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <h5 className="font-bold text-sm text-stone-900">Any Available Specialist</h5>
                  <p className="text-xs text-stone-600 mt-1">
                    First qualified agronomist or farm instructor on duty for your chosen date and time.
                  </p>
                </div>

                {staff.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStaffId(st.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedStaffId === st.id
                        ? 'border-emerald-800 bg-emerald-50/40 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <h5 className="font-bold text-sm text-stone-900">{st.name}</h5>
                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">{st.role}</p>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">{st.bio}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Select Date</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Date */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-base">Select an Appointment Date</h4>
                  <p className="text-xs text-stone-500">
                    Bookings accepted up to {maxAdvanceDays} days in advance. (Timezone: {business?.timezone || 'Asia/Kolkata'})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Back to Specialist
                </button>
              </div>

              {/* Month Navigation */}
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h5 className="font-bold text-stone-900 text-sm">
                    {monthNames[month]} {year}
                  </h5>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                      disabled={month === today.getMonth() && year === today.getFullYear()}
                      className="p-1.5 rounded text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                      className="p-1.5 rounded text-stone-600 hover:bg-stone-100 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 pt-3 text-center text-xs font-semibold text-stone-400">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 gap-1 pt-2">
                  {[...Array(firstDayIndex)].map((_, i) => (
                    <div key={`empty-${i}`} className="p-2" />
                  ))}

                  {[...Array(daysInMonth)].map((_, i) => {
                    const dayNum = i + 1;
                    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isPast = dStr < todayStr;
                    const isTooFar = dStr > maxDateStr;
                    const isSelected = selectedDate === dStr;
                    const isBlocked = business?.blockedDates?.some((b) => b.date === dStr && b.allDay);

                    const disabled = isPast || isTooFar || isBlocked;

                    return (
                      <button
                        key={dStr}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleDateSelect(dStr)}
                        className={`p-2.5 rounded-lg text-xs font-semibold transition-all tabular-nums cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : disabled
                            ? 'text-stone-300 cursor-not-allowed'
                            : 'text-stone-800 hover:bg-emerald-100 hover:text-emerald-900'
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-stone-600">
                    Selected Date: <strong>{selectedDate}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceed to Time Slots</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Select Time Slot */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-base">Select Time Slot</h4>
                  <p className="text-xs text-stone-500">
                    Date: <strong>{selectedDate}</strong> · Service Duration: <strong>{currentService?.durationMinutes} mins</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Change Date
                </button>
              </div>

              {slotsLoading ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-800" />
                  <span>Checking live schedule availability...</span>
                </div>
              ) : availabilityReason ? (
                <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-2">
                  <p className="font-bold">No Available Slots for this Date</p>
                  <p>{availabilityReason}</p>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-semibold text-amber-800 underline cursor-pointer"
                  >
                    Choose another date
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`p-3 rounded-lg text-xs font-semibold transition-all tabular-nums text-center cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-800'
                              : !slot.available
                              ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200 line-through'
                              : 'bg-white text-stone-800 border border-stone-200 hover:border-emerald-700 hover:bg-emerald-50/50'
                          }`}
                          title={slot.reason || slot.displayTime}
                        >
                          <div>{slot.displayTime}</div>
                          {!slot.available && (
                            <div className="text-[10px] text-stone-400 no-underline font-normal truncate mt-0.5">
                              Reserved
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!selectedSlot}
                      onClick={() => setStep(5)}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>Enter Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Customer Details */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-stone-900 text-base">Your Contact Details</h4>
                <p className="text-xs text-stone-500">
                  Required to send your booking confirmation reference and visit guidelines.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98450 XXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    We will send your confirmation and location pin to this number.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Customer Notes or Specific Interest (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Inquiring for 50kg milky mushroom spawn, or group of 4 farmers visiting from Davanagere."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!customerName.trim() || !customerPhone.trim()}
                  onClick={() => setStep(6)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <span>Review Appointment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Final Submission */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-stone-900 text-base">Review Appointment Details</h4>
                <p className="text-xs text-stone-500">
                  Please verify your visit details before submitting.
                </p>
              </div>

              <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4 text-xs sm:text-sm">
                <div className="flex justify-between items-start pb-3 border-b border-stone-200">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                      Service
                    </span>
                    <h5 className="font-bold text-stone-900 text-base">{currentService?.name}</h5>
                    <p className="text-xs text-stone-500">Duration: {currentService?.durationMinutes} mins</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-stone-900 tabular-nums">
                      {currentService?.isFree ? 'Free Consultation' : `₹${currentService?.price.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-stone-500 block text-xs">Date</span>
                    <strong className="text-stone-900">{selectedDate}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-xs">Time Slot</span>
                    <strong className="text-stone-900">{selectedSlot}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-xs">Assigned Specialist</span>
                    <strong className="text-stone-900">{currentStaff ? currentStaff.name : 'Any Available Specialist'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-xs">Farm Facility</span>
                    <strong className="text-stone-900">Bhadravati, Shivamogga, Karnataka</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200">
                  <span className="text-stone-500 block text-xs">Contact Person</span>
                  <strong className="text-stone-900">{customerName}</strong> ({customerPhone})
                  {customerEmail && <span className="text-stone-500 block text-xs">{customerEmail}</span>}
                </div>

                {customerNotes && (
                  <div className="pt-2 border-t border-stone-200">
                    <span className="text-stone-500 block text-xs">Customer Note</span>
                    <p className="text-stone-700 italic">{customerNotes}</p>
                  </div>
                )}
              </div>

              {/* Policy Notice */}
              <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <p className="font-bold">Farm Approval Policy:</p>
                <p>
                  {business?.bookingSettings?.confirmationPolicyText ||
                    'All appointments are individually scheduled. Our farm coordinator confirms your slot via WhatsApp or phone.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitBooking}
                  className="px-6 py-3 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Confirming with Farm Server...' : 'Confirm Appointment Booking'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: Confirmation Screen */}
          {step === 8 && confirmedBooking && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {confirmedBooking.status === 'Confirmed'
                    ? 'Appointment Confirmed!'
                    : 'Booking Request Received (Pending Approval)'}
                </span>
                <h4 className="font-display font-bold text-2xl text-stone-900">
                  Reference: <span className="text-emerald-900 font-mono tracking-wider">{confirmedBooking.referenceCode}</span>
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
                  {confirmedBooking.status === 'Confirmed'
                    ? 'Your appointment has been confirmed! We look forward to welcoming you to our Bhadravati mushroom facility.'
                    : 'Your appointment is awaiting manual approval from our farm coordinator. You will receive an update on WhatsApp shortly.'}
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Service:</span>
                  <span className="font-bold text-stone-900">{confirmedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Date & Time:</span>
                  <span className="font-bold text-stone-900">
                    {confirmedBooking.date} at {confirmedBooking.startTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Customer:</span>
                  <span className="font-bold text-stone-900">
                    {confirmedBooking.customerName} ({confirmedBooking.customerPhone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status:</span>
                  <span className={`font-bold ${confirmedBooking.status === 'Confirmed' ? 'text-emerald-800' : 'text-amber-700'}`}>
                    {confirmedBooking.status}
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp Action for Customer */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`https://wa.me/${(business?.whatsapp || '+91 94482 17890').replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Namaskara Sri Lakshmi Mushrooms, I have booked appointment ${confirmedBooking.referenceCode} for ${confirmedBooking.serviceName} on ${confirmedBooking.date} at ${confirmedBooking.startTime}. Customer: ${confirmedBooking.customerName}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send Confirmation to Farm WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-md transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
