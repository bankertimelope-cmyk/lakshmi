/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { About } from './components/About.tsx';
import { Services } from './components/Services.tsx';
import { WhyChooseUs } from './components/WhyChooseUs.tsx';
import { Gallery } from './components/Gallery.tsx';
import { Reviews } from './components/Reviews.tsx';
import { LocationSection } from './components/LocationSection.tsx';
import { Footer } from './components/Footer.tsx';
import { BookingSystem } from './components/BookingSystem.tsx';
import { TrackBookingModal } from './components/TrackBookingModal.tsx';
import { PolicyModals } from './components/PolicyModals.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';
import { api } from './services/api.ts';
import type {
  BusinessProfile,
  Service,
  StaffMember,
  GalleryItem,
  ReviewItem
} from './types/index.ts';

export default function App() {
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [bookingOpen, setBookingOpen] = useState<boolean>(false);
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | undefined>();
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [trackBookingOpen, setTrackBookingOpen] = useState<boolean>(false);
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | 'cancellation' | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [biz, srvs, stf, gal, revs] = await Promise.all([
          api.getBusinessProfile(),
          api.getServices(),
          api.getStaff(),
          api.getGallery(),
          api.getReviews()
        ]);
        if (!isMounted) return;
        setBusiness(biz);
        setServices(srvs);
        setStaff(stf);
        setGallery(gal);
        setReviews(revs);
      } catch (err) {
        console.error('Error loading initial app data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenBooking = (serviceId?: string) => {
    setPreSelectedServiceId(serviceId);
    setBookingOpen(true);
  };

  const handleBusinessUpdated = (updated: BusinessProfile) => {
    setBusiness(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-stone-900 selection:bg-emerald-800 selection:text-white">
      {/* Header with Top Bar Contract */}
      <Header
        business={business}
        onOpenBooking={handleOpenBooking}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenTrackBooking={() => setTrackBookingOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero business={business} onOpenBooking={() => handleOpenBooking()} />
        <About business={business} staff={staff} onOpenBooking={() => handleOpenBooking()} />
        <Services services={services} onSelectService={handleOpenBooking} />
        <WhyChooseUs />
        <Gallery gallery={gallery} />
        <Reviews reviews={reviews} business={business} />
        <LocationSection business={business} />
      </main>

      {/* Footer & Legal Notices */}
      <Footer
        business={business}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenTrackBooking={() => setTrackBookingOpen(true)}
        onOpenPolicy={(policy) => setActivePolicy(policy)}
      />

      {/* Real Contact Floating Action */}
      <FloatingWhatsApp business={business} />

      {/* Interactive Booking System Modal */}
      <BookingSystem
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preSelectedServiceId={preSelectedServiceId}
        services={services}
        staff={staff}
        business={business}
      />

      {/* Track / Cancel Booking Modal */}
      <TrackBookingModal
        isOpen={trackBookingOpen}
        onClose={() => setTrackBookingOpen(false)}
        business={business}
      />

      {/* Policy Modals */}
      <PolicyModals
        policyType={activePolicy}
        onClose={() => setActivePolicy(null)}
        business={business}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        business={business}
        onBusinessUpdated={handleBusinessUpdated}
      />
    </div>
  );
}
