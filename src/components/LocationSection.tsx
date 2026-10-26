import React from 'react';
import { MapPin, Clock, Phone, Mail, Navigation, ExternalLink, Calendar } from 'lucide-react';
import type { BusinessProfile, DayOfWeek } from '../types/index.ts';

interface LocationSectionProps {
  business: BusinessProfile | null;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ business }) => {
  const address = business?.address;
  const hours = business?.operatingHours;
  const mapsUrl = business?.googleMapsUrl || 'https://maps.app.goo.gl/ei7zC4FHozZRQ3pL6';
  const phone = business?.phone || '+91 94482 17890';
  const email = business?.email || 'contact@srilakshmimushrooms.com';
  const lat = address?.coordinates?.lat || 13.8379967;
  const lng = address?.coordinates?.lng || 75.676201;

  // Determine today's day of week in Asia/Kolkata
  const todayInKolkata = new Intl.DateTimeFormat('en-US', {
    timeZone: business?.timezone || 'Asia/Kolkata',
    weekday: 'long'
  }).format(new Date()) as DayOfWeek;

  const days: DayOfWeek[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  return (
    <section id="location" className="py-16 lg:py-24 border-b border-stone-200 bg-[#FAFAF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            06. Farm Location & Operating Hours
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 text-balance">
            Visit Our Agrobusiness Facility in Bhadravati
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Conveniently situated along NH69 near Vishweshwaraiah Layout Bypass Road, Jannapura. Easy accessibility from Shimoga (18 km) and Bhadravati railway station.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map Embed Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl overflow-hidden border border-stone-200 shadow-xs bg-stone-100 aspect-16/10 sm:aspect-16/9 relative">
              {/* Embed OpenStreetMap / Leaflet view centered on coordinates 13.8379967, 75.676201 */}
              <iframe
                title="Sri Lakshmi Mushrooms Google Maps Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.01}%2C${lng + 0.015}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
              />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-md border border-stone-200 text-xs text-stone-700 shadow-xs font-medium">
                📍 {lat.toFixed(5)}° N, {lng.toFixed(5)}° E (Bhadravati, Karnataka)
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions via Google Maps</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>

              <a
                href={`tel:${phone.replace(/\D/g, '')}`}
                className="px-4 py-2.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-md transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-800" />
                <span>Call Farm: {phone}</span>
              </a>
            </div>
          </div>

          {/* Details & Hours Table Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Address & Contact Card */}
            <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-800" />
                <span>Physical Address</span>
              </h3>

              <div className="text-xs sm:text-sm text-stone-600 space-y-1">
                <p className="font-semibold text-stone-900">
                  {business?.legalName || 'Sri Lakshmi Mushrooms And Agrobusiness Pvt Ltd'}
                </p>
                <p>{address?.street || 'NH69, Vishweshwaraiah Layout Bypass Road'}</p>
                <p>{address?.suburb || 'Jannapura / Bullapura'}</p>
                <p>
                  {address?.city || 'Bhadravati'}, {address?.district || 'Shivamogga District'}
                </p>
                <p>
                  {address?.state || 'Karnataka'} - {address?.postalCode || '577301'}, India
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Phone & WhatsApp: <strong>{phone}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Email: <strong>{email}</strong></span>
                </div>
              </div>
            </div>

            {/* Operating Hours Table */}
            <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-800" />
                  <span>Weekly Operating Hours</span>
                </h3>
                <span className="text-[11px] font-medium text-stone-500">
                  Timezone: {business?.timezone || 'Asia/Kolkata'}
                </span>
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                {days.map((day) => {
                  const schedule = hours?.[day];
                  const isToday = day === todayInKolkata;

                  return (
                    <div
                      key={day}
                      className={`py-2 flex items-center justify-between ${
                        isToday ? 'font-bold text-emerald-900 bg-emerald-50/60 -mx-3 px-3 rounded' : 'text-stone-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{day}</span>
                        {isToday && (
                          <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">
                            (Today)
                          </span>
                        )}
                      </span>

                      <span className="tabular-nums">
                        {schedule?.isOpen ? (
                          `${schedule.openTime} - ${schedule.closeTime}`
                        ) : (
                          <span className="text-stone-400">Closed</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-stone-500 leading-normal pt-1">
                * Note: Farm visits and laboratory spawn pickups require scheduled appointments to ensure an agronomist is assigned to guide you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
