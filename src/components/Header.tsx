import React, { useState } from 'react';
import { Menu, X, Shield, Phone, CalendarCheck } from 'lucide-react';
import type { BusinessProfile } from '../types/index.ts';

interface HeaderProps {
  business: BusinessProfile | null;
  onOpenBooking: (serviceId?: string) => void;
  onOpenAdmin: () => void;
  onOpenTrackBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  onOpenBooking,
  onOpenAdmin,
  onOpenTrackBooking
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF7]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark (Single Text Element) */}
          <a
            href="#"
            className="flex items-center gap-3 group text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-900 text-emerald-100 flex items-center justify-center font-display font-bold text-xl shadow-xs group-hover:bg-emerald-950 transition-colors">
              SL
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-stone-900 leading-tight whitespace-nowrap shrink-0">
                {business?.name || 'Sri Lakshmi Mushrooms'}
              </span>
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-widest leading-none">
                Agrobusiness Pvt Ltd
              </span>
            </div>
          </a>

          {/* Zone 2: 4-5 Navigation Links (Clean single-line text links) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
            <a
              href="#about"
              className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0"
            >
              About Farm
            </a>
            <a
              href="#services"
              className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0"
            >
              Services & Training
            </a>
            <a
              href="#gallery"
              className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0"
            >
              Facility Gallery
            </a>
            <a
              href="#reviews"
              className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0"
            >
              Verified Reviews
            </a>
            <a
              href="#location"
              className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0"
            >
              Location & Hours
            </a>
          </nav>

          {/* Zone 3: Primary Action & Quick Tools */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenTrackBooking}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              title="Track existing appointment status"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-stone-500" />
              <span>Track Booking</span>
            </button>

            <button
              onClick={() => onOpenBooking()}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 rounded-md transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              Book an Appointment
            </button>

            <button
              onClick={onOpenAdmin}
              className="p-2 text-stone-400 hover:text-stone-800 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
              title="Admin Portal"
              aria-label="Admin Portal"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => onOpenBooking()}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md"
            >
              Book Now
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:bg-stone-100 rounded-md"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAFAF7] border-b border-stone-200 px-5 pt-3 pb-6 space-y-3">
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-stone-800 hover:text-emerald-800"
          >
            About Farm
          </a>
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-stone-800 hover:text-emerald-800"
          >
            Services & Training
          </a>
          <a
            href="#gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-stone-800 hover:text-emerald-800"
          >
            Facility Gallery
          </a>
          <a
            href="#reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-stone-800 hover:text-emerald-800"
          >
            Verified Reviews
          </a>
          <a
            href="#location"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-stone-800 hover:text-emerald-800"
          >
            Location & Hours
          </a>

          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrackBooking();
              }}
              className="w-full text-left py-2 text-sm font-medium text-stone-700 flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-stone-500" />
              <span>Track Existing Appointment</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-emerald-800 rounded-md"
            >
              Book an Appointment
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full text-center py-2 text-xs font-medium text-stone-500 hover:text-stone-800"
            >
              Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
