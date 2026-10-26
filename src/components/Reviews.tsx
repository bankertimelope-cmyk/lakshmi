import React from 'react';
import { Star, ShieldCheck, ExternalLink, Quote } from 'lucide-react';
import type { ReviewItem, BusinessProfile } from '../types/index.ts';

interface ReviewsProps {
  reviews: ReviewItem[];
  business: BusinessProfile | null;
}

export const Reviews: React.FC<ReviewsProps> = ({ reviews, business }) => {
  const rating = business?.rating || 4.9;
  const reviewCount = business?.reviewCount || 52;
  const mapsUrl = business?.googleMapsUrl || 'https://maps.app.goo.gl/ei7zC4FHozZRQ3pL6';

  return (
    <section id="reviews" className="py-16 lg:py-24 border-b border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              05. Authentic Ratings & Reviews
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 text-balance">
              Verified Feedback from Karnataka Farmers & Clients
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              We uphold complete transparency. The testimonials below are linked directly to our public Google Maps business profile in Bhadravati.
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="p-4 bg-[#FAFAF7] rounded-xl border border-stone-200 flex items-center gap-4 shrink-0 shadow-xs">
            <div className="text-center pr-4 border-r border-stone-200">
              <span className="font-display text-3xl font-bold text-stone-900 tabular-nums">
                {rating}
              </span>
              <div className="flex items-center text-amber-500 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Verified Business Profile</span>
              </div>
              <p className="text-xs text-stone-500 tabular-nums">
                Based on {reviewCount}+ authentic customer reviews
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>Read all on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-[#FAFAF7] rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(Math.floor(rev.rating))].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    {rev.rating % 1 !== 0 && (
                      <span className="text-xs font-bold text-stone-700 ml-1 tabular-nums">
                        {rev.rating}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-600 font-medium">{rev.date}</span>
                </div>

                <div className="text-xs font-semibold text-emerald-800">
                  Highlight: {rev.highlightAspect}
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-stone-900 block">{rev.author}</span>
                  <span className="text-stone-600 text-[11px]">{rev.verifiedSource}</span>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-600 hover:text-emerald-800 font-medium text-[11px] flex items-center gap-1"
                >
                  <span>Verify</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
