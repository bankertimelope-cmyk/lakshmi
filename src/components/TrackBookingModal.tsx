import React, { useState } from 'react';
import { X, Search, Calendar, Clock, User, AlertCircle, CheckCircle, Ban } from 'lucide-react';
import { api } from '../services/api.ts';
import type { Appointment, BusinessProfile } from '../types/index.ts';

interface TrackBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessProfile | null;
}

export const TrackBookingModal: React.FC<TrackBookingModalProps> = ({
  isOpen,
  onClose,
  business
}) => {
  const [referenceInput, setReferenceInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Partial<Appointment> | null>(null);

  // Cancellation state
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [verifyPhone, setVerifyPhone] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceInput.trim()) return;

    setLoading(true);
    setError(null);
    setBooking(null);
    setShowCancelPrompt(false);
    setCancelSuccess(null);

    try {
      const data = await api.getAppointmentByReference(referenceInput);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'No appointment found with that reference code.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!booking?.referenceCode || !verifyPhone.trim()) return;

    setCancelLoading(true);
    setError(null);

    try {
      await api.cancelAppointment(booking.referenceCode, verifyPhone);
      setCancelSuccess('Appointment successfully cancelled.');
      setBooking({ ...booking, status: 'Cancelled' });
      setShowCancelPrompt(false);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel appointment. Verify your phone number.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-lg w-full p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Customer Portal
            </span>
            <h3 className="font-display font-bold text-lg text-stone-900">
              Track Your Appointment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLookup} className="space-y-3">
          <label className="block text-xs font-semibold text-stone-700">
            Booking Reference Code (e.g. SLM-8491)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="SLM-XXXX"
              required
              value={referenceInput}
              onChange={(e) => setReferenceInput(e.target.value.toUpperCase())}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm uppercase font-mono tracking-wider border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Finding...' : 'Track'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {cancelSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>{cancelSuccess}</span>
          </div>
        )}

        {booking && (
          <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="font-mono font-bold text-sm text-stone-900">
                {booking.referenceCode}
              </span>
              <span
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  booking.status === 'Confirmed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : booking.status === 'Pending'
                    ? 'bg-amber-100 text-amber-800'
                    : booking.status === 'Cancelled'
                    ? 'bg-stone-200 text-stone-600'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Service:</span>
                <span className="font-semibold text-stone-900">{booking.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Date:</span>
                <span className="font-semibold text-stone-900">{booking.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Scheduled Time:</span>
                <span className="font-semibold text-stone-900">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Specialist:</span>
                <span className="font-semibold text-stone-900">{booking.staffName || 'Duty Agronomist'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Booked By:</span>
                <span className="font-semibold text-stone-900">{booking.customerName}</span>
              </div>
            </div>

            {/* Self Cancel Option */}
            {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
              <div className="pt-3 border-t border-stone-200">
                {!showCancelPrompt ? (
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(true)}
                    className="text-stone-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Need to cancel this appointment?</span>
                  </button>
                ) : (
                  <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg space-y-2">
                    <p className="text-[11px] font-bold text-red-900">
                      Confirm Cancellation: Enter your phone number to verify identity.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="Mobile number used for booking"
                        value={verifyPhone}
                        onChange={(e) => setVerifyPhone(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded"
                      />
                      <button
                        type="button"
                        disabled={cancelLoading || !verifyPhone.trim()}
                        onClick={handleConfirmCancel}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded disabled:opacity-50 cursor-pointer"
                      >
                        {cancelLoading ? 'Cancelling...' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
