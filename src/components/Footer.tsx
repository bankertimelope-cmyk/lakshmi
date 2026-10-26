import React from 'react';
import { MapPin, Phone, Mail, Shield, ExternalLink, CalendarCheck } from 'lucide-react';
import type { BusinessProfile } from '../types/index.ts';

interface FooterProps {
  business: BusinessProfile | null;
  onOpenBooking: (serviceId?: string) => void;
  onOpenAdmin: () => void;
  onOpenTrackBooking: () => void;
  onOpenPolicy: (type: 'privacy' | 'terms' | 'cancellation') => void;
}

export const Footer: React.FC<FooterProps> = ({
  business,
  onOpenBooking,
  onOpenAdmin,
  onOpenTrackBooking,
  onOpenPolicy
}) => {
  const currentYear = new Date().getFullYear();
  const phone = business?.phone || '+91 94482 17890';
  const email = business?.email || 'contact@srilakshmimushrooms.com';
  const mapsUrl = business?.googleMapsUrl || 'https://maps.app.goo.gl/ei7zC4FHozZRQ3pL6';

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      {/* Pre-footer Call to Action */}
      <div className="border-b border-stone-800 py-12 bg-emerald-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="font-display text-2xl font-bold text-white">
              Ready to Visit Our Bhadravati Mushroom Farm?
            </h3>
            <p className="text-xs sm:text-sm text-stone-400">
              Schedule your farm tour, book laboratory spawns, or enroll in practical hands-on cultivation workshops.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenBooking()}
              className="px-6 py-3 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Book an Appointment
            </button>
            <a
              href={`https://wa.me/${phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 text-xs font-semibold text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand & Profile */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-display font-bold text-lg">
                SL
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-white">
                  {business?.name || 'Sri Lakshmi Mushrooms'}
                </h4>
                <p className="text-[11px] text-stone-400 uppercase tracking-widest">
                  Agrobusiness Private Limited
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Integrated organic mushroom cultivation facility, pure laboratory spawn propagation center, and commercial agribusiness training academy in Bhadravati, Shivamogga, Karnataka.
            </p>

            <div className="space-y-2 text-xs text-stone-400 pt-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>NH69, Vishweshwaraiah Layout Bypass Road, Jannapura / Bullapura, Bhadravati, Karnataka 577301</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{email}</span>
              </p>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-white transition-colors">About Facility</a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">Services & Training</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">Photo Gallery</a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-white transition-colors">Customer Reviews</a>
              </li>
              <li>
                <a href="#location" className="hover:text-white transition-colors">Location & Hours</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Services & Booking */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Appointments
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenBooking()}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Book Farm Visit
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenBooking('srv-training-masterclass')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Cultivation Workshop
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenBooking('srv-spawn-booking')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Reserve Mother Spawn
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTrackBooking}
                  className="hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer text-emerald-400"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Track Booking Status</span>
                </button>
              </li>
              <li>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Google Maps Listing</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Policies & Legal */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Policies & Administration
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenPolicy('cancellation')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Admin Dashboard</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Quiet Bottom Strip */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {currentYear} {business?.legalName || 'Sri Lakshmi Mushrooms And Agrobusiness Pvt Ltd'}. All rights reserved.
          </p>
          <p className="text-[11px] text-stone-500">
            Organic Mushroom Cultivation · Bhadravati, Shivamogga, Karnataka, India
          </p>
        </div>
      </div>
    </footer>
  );
};
