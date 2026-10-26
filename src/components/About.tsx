import React from 'react';
import { CheckCircle2, FlaskConical, ThermometerSnowflake, Recycle } from 'lucide-react';
import type { BusinessProfile, StaffMember } from '../types/index.ts';

interface AboutProps {
  business: BusinessProfile | null;
  staff: StaffMember[];
  onOpenBooking: () => void;
}

export const About: React.FC<AboutProps> = ({ business, staff, onOpenBooking }) => {
  return (
    <section id="about" className="py-16 lg:py-24 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            01. Authentic Agrobusiness Profile
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 text-balance">
            Rooted in Sustainable Bio-Farming & Farmer Empowerment in Karnataka
          </h2>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
            {business?.name || 'Sri Lakshmi Mushrooms And Agrobusiness Pvt Ltd'} is an integrated organic mushroom cultivation center, biotechnology spawn propagation laboratory, and commercial agro-advisory enterprise located in Bhadravati, Shivamogga District.
          </p>
        </div>

        {/* 2-Column Split: Story & Technical Facilities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Image Collage & Cleanroom Spotlight */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm aspect-4/3 bg-stone-100 relative">
              <img
                src="/src/assets/images/mushroom_spawn_lab_1793029230218.jpg"
                alt="Sri Lakshmi Mushrooms Spawn Laboratory in Bhadravati"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5 text-white">
                <div>
                  <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                    In-House Spawn Bio-Lab
                  </p>
                  <p className="text-sm font-medium">
                    Strict laminar airflow inoculation preventing wild spores and contamination.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-stone-100 border border-stone-200 space-y-1">
                <ThermometerSnowflake className="w-5 h-5 text-emerald-800" />
                <h4 className="font-semibold text-sm text-stone-900">Climate Chambers</h4>
                <p className="text-xs text-stone-600">Strict 22°C–28°C and 85%+ relative humidity control.</p>
              </div>
              <div className="p-4 rounded-lg bg-stone-100 border border-stone-200 space-y-1">
                <Recycle className="w-5 h-5 text-emerald-800" />
                <h4 className="font-semibold text-sm text-stone-900">Circular Agrobusiness</h4>
                <p className="text-xs text-stone-600">Spent substrate recycled into enriched organic vermicompost.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Values */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 text-stone-600 leading-relaxed text-sm sm:text-base">
              <p>
                Unlike generic distributors, Sri Lakshmi Mushrooms conducts the complete lifecycle under one roof: from pure laboratory strain maintenance and mother spawn multiplication to temperature-regulated fruiting chambers and post-harvest drying.
              </p>
              <p>
                We serve commercial kitchens, regional wholesale markets, and organic retail chains across Malnad and Karnataka, while actively mentoring aspiring farmers to launch viable commercial mushroom micro-enterprises with bank subsidies.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <h3 className="font-semibold text-stone-900 text-sm uppercase tracking-wider">
                Core Operational Pillars
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-3 text-sm text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>First-Generation Spawn Propagation:</strong> Cultivated using triple-sterilized grain medium to ensure rapid colonization and high biological efficiency.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Zero Chemical Additives:</strong> Grown strictly on organic agricultural residues (paddy straw, wheat bran) without chemical growth accelerants.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Farmer Training & Buyback Advisory:</strong> Practical guidance on humidity, pest safeguards, harvest timing, and regional marketing networks.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <button
                onClick={onOpenBooking}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors cursor-pointer"
              >
                Schedule a Visit with Our Agronomists
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Team / Specialist Leadership */}
        {staff.length > 0 && (
          <div className="pt-8 border-t border-stone-200 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Scientific & Operational Leadership
              </p>
              <h3 className="font-display text-2xl font-bold text-stone-900">
                Meet Our Agro-Specialists & Trainers
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-lg p-6 border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base">
                    {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-base">{member.name}</h4>
                    <p className="text-xs font-semibold text-emerald-800">{member.role}</p>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {member.bio}
                  </p>
                  {member.specialties.length > 0 && (
                    <div className="pt-2 text-[11px] text-stone-500 flex flex-wrap gap-1.5">
                      {member.specialties.map((spec, i) => (
                        <span key={i} className="text-stone-600">
                          {spec}{i < member.specialties.length - 1 ? ' · ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
