import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { BusinessProfile } from '../types/index.ts';

interface FloatingWhatsAppProps {
  business: BusinessProfile | null;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ business }) => {
  const whatsapp = business?.whatsapp || business?.phone || '+91 94482 17890';
  const cleanNumber = whatsapp.replace(/\D/g, '');
  const farmName = business?.name || 'Sri Lakshmi Mushrooms';

  const defaultMessage = `Namaskara ${farmName}, I would like to inquire about farm visits, spawns, and training workshops in Bhadravati.`;

  return (
    <aside aria-label="Quick contact" className="fixed bottom-5 right-5 z-30">
      <a
        href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 px-4 py-2.5 bg-[#25D366] text-white font-semibold text-xs rounded-full shadow-lg hover:bg-[#1EBE5D] transition-all hover:scale-103 cursor-pointer"
        aria-label="Chat with farm on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
        <span className="hidden sm:inline font-bold">Chat on WhatsApp</span>
      </a>
    </aside>
  );
};
