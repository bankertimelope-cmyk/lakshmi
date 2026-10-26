import React from 'react';
import { ArrowRight, Phone, MapPin, Star, ShieldCheck, Sprout, Award, Users } from 'lucide-react';
import type { BusinessProfile } from '../types/index.ts';

interface HeroProps {
  business: BusinessProfile | null;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ business, onOpenBooking }) => {
  const phone = business?.phone || '+91 94482 17890';
  const whatsapp = business?.whatsapp || '+91 94482 17890';
  const cleanPhone = phone.replace(/\D/g, '');

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-Column Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Headline, Trust Signals & Primary Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Editorial Location Kicker (Clean unboxed text, no pills) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
              <span className="flex items-center gap-1 text-emerald-800">
                <MapPin className="w-3.5 h-3.5" />
                <span>Bhadravati, Shivamogga, Karnataka</span>
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="flex items-center gap-1 text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="tabular-nums font-bold">4.9</span>
                <span>(52+ Verified Reviews)</span>
              </span>
            </div>

            {/* Dominant Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1] text-balance">
              Pure Organic Mushrooms, High-Yield Spawns & Agro Training
            </h1>

            {/* Value Proposition Body Prose */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              Welcome to <strong className="text-stone-900 font-semibold">{business?.name || 'Sri Lakshmi Mushrooms And Agrobusiness Pvt Ltd'}</strong>. We operate advanced climate-controlled mushroom cultivation facilities, biotechnology spawn laboratories, and certified hands-on farmer workshops in Bhadravati.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenBooking}
                className="px-6 py-3 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 rounded-md transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Book an Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Namaskara Sri Lakshmi Mushrooms, I would like to inquire about farm visits, spawns, and training.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 text-sm font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-md transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>WhatsApp: {phone}</span>
              </a>
            </div>

            {/* Direct Verified Profile Link */}
            <div className="pt-1 flex items-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Official Google Maps Business Profile:</span>
              <a
                href={business?.googleMapsUrl || 'https://maps.app.goo.gl/ei7zC4FHozZRQ3pL6'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 hover:underline font-medium"
              >
                View on Google Maps ↗
              </a>
            </div>
          </div>

          {/* Right Column: High-Fidelity Authentic Photography Carrier */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100 aspect-16/10 sm:aspect-4/3 lg:aspect-auto lg:h-[440px]">
              <img
                src={business?.branding?.heroImageUrl || '/src/assets/images/hero_mushroom_facility_1793029229491.jpg'}
                alt="Sri Lakshmi Mushrooms climate-controlled vertical cultivation facility in Bhadravati"
                className="w-full h-full object-cover object-center"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                <div className="text-white space-y-1">
                  <p className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                    Bhadravati Production Facility
                  </p>
                  <p className="text-sm font-medium leading-snug">
                    Climate-controlled vertical racks producing certified organic Oyster and Milky mushrooms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Proof & Trust Metric Strip (Full-width row below hero split) */}
        <div className="mt-14 pt-8 border-t border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
              <Sprout className="w-4 h-4" />
              <span>Cultivation</span>
            </div>
            <p className="font-display text-2xl font-bold text-stone-900 tabular-nums">100% Organic</p>
            <p className="text-xs text-stone-500">Zero synthetic chemical fertilizers or pesticides</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Bio-Laboratory</span>
            </div>
            <p className="font-display text-2xl font-bold text-stone-900 tabular-nums">Pure Grain Spawn</p>
            <p className="text-xs text-stone-500">First-generation laboratory tested mycelium strains</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Farmer Empowerment</span>
            </div>
            <p className="font-display text-2xl font-bold text-stone-900 tabular-nums">200+ Trained</p>
            <p className="text-xs text-stone-500">Mentored across Shivamogga & Karnataka districts</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Agrobusiness DPR</span>
            </div>
            <p className="font-display text-2xl font-bold text-stone-900 tabular-nums">Govt Subsidy Support</p>
            <p className="text-xs text-stone-500">NHB / MIDH commercial farm setup advisory</p>
          </div>
        </div>
      </div>
    </section>
  );
};
