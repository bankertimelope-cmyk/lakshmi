import React, { useState } from 'react';
import { Clock, Check, ArrowRight, IndianRupee, Users } from 'lucide-react';
import type { Service } from '../types/index.ts';

interface ServicesProps {
  services: Service[];
  onSelectService: (serviceId: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ services, onSelectService }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(services.map((s) => s.category)))];

  const filtered =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <section id="services" className="py-16 lg:py-24 border-b border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              02. Services & Training Programs
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 text-balance">
              Explore Our Farm Visits, Hands-on Workshops & Agri-Consulting
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Book certified visits to our cultivation chambers, masterclass workshops for aspiring growers, and direct commercial consulting for mushroom entrepreneurs.
            </p>
          </div>

          {/* Interactive Filter Control (Functional button tabs) */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat === 'all' ? 'All Services' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col bg-[#FAFAF7] rounded-xl border border-stone-200 overflow-hidden hover:border-emerald-700/50 transition-all hover:shadow-sm"
            >
              {/* Service Media */}
              {service.imageUrl && (
                <div className="relative aspect-16/10 overflow-hidden bg-stone-200">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                    {service.category}
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-stone-900 leading-snug group-hover:text-emerald-900 transition-colors">
                      {service.name}
                    </h3>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {service.fullDescription || service.shortDescription}
                  </p>

                  {/* Duration and Capacity metadata */}
                  <div className="flex items-center gap-4 text-xs font-medium text-stone-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span className="tabular-nums">{service.durationMinutes} mins</span>
                    </span>
                    {service.maxGroupSize && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        <span>Up to {service.maxGroupSize} participants</span>
                      </span>
                    )}
                  </div>

                  {/* Deliverables / Inclusions */}
                  {service.deliverables && service.deliverables.length > 0 && (
                    <div className="pt-3 border-t border-stone-200 space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        What's Included:
                      </p>
                      <ul className="space-y-1">
                        {service.deliverables.slice(0, 3).map((d, i) => (
                          <li key={i} className="text-xs text-stone-700 flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Price and Book CTA */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-medium text-stone-500 block">Fee / Contribution</span>
                    <div className="flex items-center text-lg font-bold text-stone-900 tabular-nums">
                      {service.isFree ? (
                        <span className="text-emerald-800 font-semibold text-sm">Free Consultation</span>
                      ) : (
                        <>
                          <span>₹{service.price.toLocaleString('en-IN')}</span>
                          {service.isPriceFrom && <span className="text-xs font-normal text-stone-500 ml-1">onwards</span>}
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectService(service.id)}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 rounded-md transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
