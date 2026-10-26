import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { GalleryItem } from '../types/index.ts';

interface GalleryProps {
  gallery: GalleryItem[];
}

export const Gallery: React.FC<GalleryProps> = ({ gallery }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ['all', ...Array.from(new Set(gallery.map((g) => g.category)))];

  const filtered =
    selectedCategory === 'all'
      ? gallery
      : gallery.filter((g) => g.category === selectedCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filtered.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
    }
  };

  return (
    <section id="gallery" className="py-16 lg:py-24 border-b border-stone-200 bg-[#FAFAF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              04. Photo Gallery & Facility Inspection
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 text-balance">
              Authentic Views of Our Bhadravati Farm & Operations
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Explore photographs of our climate-controlled grow rooms, sterile spawn inoculation chambers, fresh harvest crates, and farmer training workshops.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat === 'all' ? 'All Photos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative rounded-xl overflow-hidden border border-stone-200 bg-white aspect-4/3 cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-5 text-white">
                <div className="flex justify-end">
                  <span className="p-2 rounded-full bg-black/40 backdrop-blur-xs text-white">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-sm leading-snug">{item.title}</h4>
                  <p className="text-xs text-stone-200 line-clamp-2">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-stone-300 p-2 cursor-pointer"
              aria-label="Close photo preview"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {filtered.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Main Image */}
            <div className="rounded-lg overflow-hidden border border-stone-800 bg-stone-900 max-h-[72vh] flex items-center justify-center">
              <img
                src={filtered[lightboxIndex].imageUrl}
                alt={filtered[lightboxIndex].title}
                className="max-h-[72vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Caption */}
            <div className="w-full mt-4 text-center text-white space-y-1">
              <h4 className="text-base font-bold">{filtered[lightboxIndex].title}</h4>
              <p className="text-xs text-stone-300 max-w-2xl mx-auto">
                {filtered[lightboxIndex].description}
              </p>
              <p className="text-[11px] text-stone-400 tabular-nums">
                Photo {lightboxIndex + 1} of {filtered.length} · Category: {filtered[lightboxIndex].category}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
