import React from 'react';
import { X, Shield, FileText, Ban } from 'lucide-react';
import type { BusinessProfile } from '../types/index.ts';

interface PolicyModalsProps {
  policyType: 'privacy' | 'terms' | 'cancellation' | null;
  onClose: () => void;
  business: BusinessProfile | null;
}

export const PolicyModals: React.FC<PolicyModalsProps> = ({
  policyType,
  onClose,
  business
}) => {
  if (!policyType) return null;

  const businessName = business?.name || 'Sri Lakshmi Mushrooms And Agrobusiness Pvt Ltd';
  const noticeHours = business?.bookingSettings?.cancellationNoticeHours || 12;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            {policyType === 'privacy' && <Shield className="w-5 h-5 text-emerald-800" />}
            {policyType === 'terms' && <FileText className="w-5 h-5 text-emerald-800" />}
            {policyType === 'cancellation' && <Ban className="w-5 h-5 text-emerald-800" />}
            <h3 className="font-display font-bold text-xl text-stone-900">
              {policyType === 'privacy' && 'Privacy Policy'}
              {policyType === 'terms' && 'Terms and Conditions'}
              {policyType === 'cancellation' && 'Cancellation & Rescheduling Policy'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-stone-600 leading-relaxed space-y-4">
          {policyType === 'privacy' && (
            <>
              <p>
                At <strong>{businessName}</strong>, we respect your personal privacy. This policy describes how we collect, use, and protect your booking details.
              </p>
              <h4 className="font-bold text-stone-900 text-sm">Information We Collect</h4>
              <p>
                We only collect contact details necessary to schedule and coordinate your visit, workshop attendance, or spawn reservations: your full name, phone number, optional email address, and booking notes.
              </p>
              <h4 className="font-bold text-stone-900 text-sm">How We Use Your Data</h4>
              <p>
                Your details are used strictly to communicate appointment status via WhatsApp/SMS/phone, provide farm directions, and maintain accurate operational records. We never sell, rent, or distribute customer details to third parties.
              </p>
              <h4 className="font-bold text-stone-900 text-sm">Data Retention & Rights</h4>
              <p>
                Customers may contact our administrative team at any time to request inspection, modification, or erasure of their appointment records from our database.
              </p>
            </>
          )}

          {policyType === 'terms' && (
            <>
              <p>
                By requesting an appointment or participating in farm tours and training at <strong>{businessName}</strong> in Bhadravati, Karnataka, you agree to these operational terms:
              </p>
              <h4 className="font-bold text-stone-900 text-sm">Bio-Security & Farm Hygiene</h4>
              <p>
                Visitors entering climate-controlled grow rooms and spawn laboratory observation zones must adhere to hygiene protocols, wear clean footwear, and comply with instructions provided by our lead agronomist.
              </p>
              <h4 className="font-bold text-stone-900 text-sm">Booking Approvals</h4>
              <p>
                Due to limited chamber capacity and hands-on masterclass limits, all appointment submissions require confirmation from our farm coordinator before arrival.
              </p>
              <h4 className="font-bold text-stone-900 text-sm">Pricing & Spawn Guarantees</h4>
              <p>
                Spawn batches reserved online are freshly harvested from active cultures. While we guarantee high fungal viability and purity upon dispatch, crop yield is contingent on your localized humidity and temperature management.
              </p>
            </>
          )}

          {policyType === 'cancellation' && (
            <>
              <p>
                We understand that travel and farming schedules can shift. We strive to accommodate rescheduling whenever possible:
              </p>
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 space-y-2">
                <p className="font-bold text-stone-900 text-xs sm:text-sm">
                  Advance Notice Requirement: {noticeHours} Hours
                </p>
                <p className="text-xs text-stone-600">
                  {business?.bookingSettings?.cancellationPolicyText ||
                    `Please notify us at least ${noticeHours} hours in advance if you wish to reschedule or cancel your visit.`}
                </p>
              </div>
              <h4 className="font-bold text-stone-900 text-sm">How to Reschedule or Cancel</h4>
              <p>
                You can track your appointment using the "Track Booking" tool on this website using your unique reference code, or message our farm coordinator directly via WhatsApp at {business?.whatsapp || business?.phone}.
              </p>
              <h4 className="font-bold text-stone-900 text-sm">No-Show Policy</h4>
              <p>
                Failure to attend a reserved workshop without prior notice may result in your slot being released to waiting farmers on our standby list.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
