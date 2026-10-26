import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  BusinessProfile,
  Service,
  StaffMember,
  Appointment,
  GalleryItem,
  ReviewItem,
  NotificationLog,
  AvailableTimeSlot,
  DayOfWeek,
  AppointmentStatus
} from '../src/types/index.ts';

interface DatabaseSchema {
  business: BusinessProfile;
  services: Service[];
  staff: StaffMember[];
  appointments: Appointment[];
  gallery: GalleryItem[];
  reviews: ReviewItem[];
  notifications: NotificationLog[];
  admin: {
    email: string;
    passwordHash: string;
    salt: string;
  };
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

// Mutex for concurrency-safe database operations
class Mutex {
  private queue: (() => void)[] = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const execute = () => {
        this.locked = true;
        resolve(() => {
          this.locked = false;
          const next = this.queue.shift();
          if (next) {
            next();
          }
        });
      };

      if (this.locked) {
        this.queue.push(execute);
      } else {
        execute();
      }
    });
  }
}

const dbMutex = new Mutex();

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

const DEFAULT_SALT = 'sri_lakshmi_agrobusiness_salt_2026';
const DEFAULT_PASSWORD = 'FarmAdmin2026!';

const INITIAL_DATA: DatabaseSchema = {
  business: {
    id: 'sri-lakshmi-mushrooms',
    name: 'Sri Lakshmi Mushrooms And Agrobusiness Pvt Ltd',
    legalName: 'Sri Lakshmi Mushrooms And Agrobusiness Private Limited',
    category: 'Organic Farm & Commercial Mushroom Cultivation',
    description: 'Leading organic mushroom production farm, biotechnology spawn laboratory, and commercial agribusiness consulting center in Bhadravati, Shivamogga, Karnataka. Specializing in high-yield oyster, milky, and medicinal mushroom cultivation, certified spawns, farm training, and project setup assistance.',
    shortTagline: 'Certified Organic Mushrooms, High-Yield Spawns & Commercial Cultivation Training in Karnataka',
    address: {
      street: 'NH69, Vishweshwaraiah Layout Bypass Road',
      suburb: 'Jannapura / Bullapura',
      city: 'Bhadravati',
      district: 'Shivamogga (Shimoga)',
      state: 'Karnataka',
      postalCode: '577301',
      country: 'India',
      formatted: 'NH69, Vishweshwaraiah Layout Bypass Road, Jannapura, Bhadravati, Karnataka 577301, India',
      coordinates: {
        lat: 13.8379967,
        lng: 75.676201
      }
    },
    phone: '+91 94482 17890',
    whatsapp: '+91 94482 17890',
    email: 'contact@srilakshmimushrooms.com',
    googleMapsUrl: 'https://maps.app.goo.gl/ei7zC4FHozZRQ3pL6',
    placeId: '0x3bbb010331732645:0xd4bc6a342116b2cd',
    rating: 4.9,
    reviewCount: 52,
    establishedYear: 2018,
    currency: '₹',
    timezone: 'Asia/Kolkata',
    operatingHours: {
      Monday: { isOpen: true, openTime: '09:00', closeTime: '18:30' },
      Tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:30' },
      Wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:30' },
      Thursday: { isOpen: true, openTime: '09:00', closeTime: '18:30' },
      Friday: { isOpen: true, openTime: '09:00', closeTime: '18:30' },
      Saturday: { isOpen: true, openTime: '09:00', closeTime: '18:30' },
      Sunday: { isOpen: true, openTime: '09:30', closeTime: '14:00' }
    },
    blockedDates: [],
    bookingSettings: {
      autoConfirm: false, // Manual approval by default as required
      minNoticeHours: 4,
      maxAdvanceDays: 30,
      bufferMinutes: 15,
      cancellationNoticeHours: 12,
      confirmationPolicyText: 'All appointments are individually scheduled to give you hands-on personal guidance. Our farm coordinator confirms your slot via WhatsApp or phone.',
      cancellationPolicyText: 'Please notify us at least 12 hours in advance if you wish to reschedule your visit or consultation.'
    },
    branding: {
      primaryColor: '#166534', // Emerald 800
      accentColor: '#B45309', // Amber 700
      heroImageUrl: '/src/assets/images/hero_mushroom_facility_1793029229491.jpg'
    }
  },
  services: [
    {
      id: 'srv-farm-tour',
      name: 'Commercial Farm Tour & Facility Walkthrough',
      shortDescription: 'Guided tour of climate-controlled chambers, misting infrastructure & vertical growing racks.',
      fullDescription: 'Experience our full-scale organic mushroom cultivation setup in Bhadravati. Tour the vertical growing rooms, observe temperature and humidity control automation, and learn about the lifecycle of Oyster and Milky mushrooms with our lead agronomist.',
      category: 'Farm Tours',
      durationMinutes: 45,
      price: 350,
      isPriceFrom: false,
      isFree: false,
      isActive: true,
      imageUrl: '/src/assets/images/hero_mushroom_facility_1793029229491.jpg',
      deliverables: [
        'Full access to climate-controlled grow chambers',
        'Demonstration of vertical rack system and misting technology',
        'Direct Q&A with farm technical coordinator',
        'Fresh mushroom harvest demonstration'
      ],
      maxGroupSize: 10
    },
    {
      id: 'srv-training-masterclass',
      name: 'Hands-on Cultivation Training & Inoculation Masterclass',
      shortDescription: 'Intensive practical training in substrate preparation, steam sterilization & spawn inoculation.',
      fullDescription: 'Comprehensive workshop for farmers, students, and new agribusiness entrepreneurs. You will prepare mushroom cultivation bags hands-on, learn paddy straw treatment, sterilization techniques, spawn mixing ratios, disease prevention, and post-harvest handling.',
      category: 'Training & Workshops',
      durationMinutes: 90,
      price: 1500,
      isPriceFrom: false,
      isFree: false,
      isActive: true,
      imageUrl: '/src/assets/images/agrobusiness_consulting_tour_1793029232226.jpg',
      deliverables: [
        'Hands-on bag preparation & inoculation practice',
        'Comprehensive Kannada & English cultivation guidebook',
        'Complimentary 1kg laboratory-grade spawn bag to take home',
        'Lifetime technical phone support for your first harvest'
      ],
      maxGroupSize: 6
    },
    {
      id: 'srv-agrobusiness-dpr',
      name: 'Commercial Agrobusiness Setup & Project Report (DPR) Consultation',
      shortDescription: 'Expert consulting on farm establishment, NABARD/NHB government subsidies, and project feasibility.',
      fullDescription: 'Planning to launch a commercial mushroom farm? Consult directly with our founders on farm architecture, insulated chamber engineering, HVAC climate control systems, Capex/Opex modeling, and state horticulture department subsidy documentation.',
      category: 'Agrobusiness Consulting',
      durationMinutes: 60,
      price: 2000,
      isPriceFrom: false,
      isFree: false,
      isActive: true,
      imageUrl: '/src/assets/images/farm_exterior_storefront_1793029232555.jpg',
      deliverables: [
        'Detailed Project Report (DPR) feasibility review',
        'Government subsidy eligibility guidelines (NHB/MIDH/NABARD)',
        'Civil layout and chamber ventilation design schematics',
        'Buyback and regional market distribution advisory'
      ],
      maxGroupSize: 4
    },
    {
      id: 'srv-spawn-booking',
      name: 'Laboratory Mother Spawn Reservation & Quality Verification',
      shortDescription: 'Inspect and reserve first-generation pure grain spawn for Oyster & Milky varieties.',
      fullDescription: 'Visit our biotechnology laboratory to inspect mycelial density, reserve fresh master grain spawn batches, and learn proper spawn storage and multiplication procedures. Guaranteed high-yielding, contamination-free strains.',
      category: 'Spawn & Lab Culture',
      durationMinutes: 30,
      price: 180,
      isPriceFrom: true,
      isFree: false,
      isActive: true,
      imageUrl: '/src/assets/images/mushroom_spawn_lab_1793029230218.jpg',
      deliverables: [
        'Purity verification under laminar flow environment',
        'Spawn batch viability and mycelium density certificate',
        'Direct consultation on storage and humidity protocols',
        'Priority batch allocation'
      ],
      maxGroupSize: 3
    },
    {
      id: 'srv-wholesale-procure',
      name: 'Bulk Organic Harvest Procurement & Distributor Meeting',
      shortDescription: 'Schedule wholesale fresh or sun-dried mushroom pickups for hotels, markets & retailers.',
      fullDescription: 'Discuss recurring bulk supply contracts for premium grade fresh Oyster and Milky mushrooms, solar-dehydrated mushroom slices, and protein-rich mushroom powder for commercial food businesses and retailers.',
      category: 'Wholesale & Supply',
      durationMinutes: 30,
      price: 0,
      isFree: true,
      isActive: true,
      imageUrl: '/src/assets/images/fresh_harvest_produce_1793029231043.jpg',
      deliverables: [
        'Sample tasting and grade inspection',
        'Bulk pricing tier structure and delivery schedules',
        'Organic farming certification documentation',
        'Cold chain and packaging specification review'
      ],
      maxGroupSize: 5
    },
    {
      id: 'srv-compost-advisory',
      name: 'Spent Mushroom Substrate (SMS) & Bio-Compost Advisory',
      shortDescription: 'Guidance and procurement of enriched spent substrate for organic agriculture & vermiculture.',
      fullDescription: 'Spent Mushroom Substrate is an organic powerhouse enriched with fungal enzymes and residual mycelium. Meet with our soil specialists to assess bulk SMS orders for plantation crops, nurseries, and terrace garden enrichment.',
      category: 'Organic Soil Solutions',
      durationMinutes: 30,
      price: 0,
      isFree: true,
      isActive: true,
      imageUrl: '/src/assets/images/fresh_harvest_produce_1793029231043.jpg',
      deliverables: [
        'Substrate nutrient breakdown analysis',
        'Application ratios for arecanut, coconut, and vegetables',
        'Bulk tractor trolley loading logistics'
      ],
      maxGroupSize: 4
    }
  ],
  staff: [
    {
      id: 'stf-rk-gowda',
      name: 'Dr. R. K. Gowda',
      role: 'Chief Agri-Consultant & Managing Director',
      bio: 'Over 14 years of commercial mushroom cultivation and horticulture consultancy experience across Karnataka. Has mentored 200+ rural and peri-urban mushroom farmers.',
      specialties: ['Commercial DPR Feasibility', 'Climate Control Engineering', 'Government Schemes'],
      isActive: true,
      assignedServiceIds: []
    },
    {
      id: 'stf-lakshmi-devi',
      name: 'Smt. Lakshmi Devi',
      role: 'Spawn Laboratory Director',
      bio: 'Master in Agricultural Microbiology. Oversees pure strain culture maintenance, mother spawn propagation, and quality control at our Bhadravati lab facility.',
      specialties: ['Spawn Multiplication', 'Mycelium Health Diagnostics', 'Sterilization Protocols'],
      isActive: true,
      assignedServiceIds: ['srv-spawn-booking', 'srv-training-masterclass']
    },
    {
      id: 'stf-manjunath-k',
      name: 'Manjunath K.',
      role: 'Farm Operations Lead & Practical Trainer',
      bio: 'Leads day-to-day cultivation chamber microclimate management, harvest timing, and practical farmer hands-on workshops.',
      specialties: ['Practical Inoculation', 'Pest Prevention', 'Harvest & Storage'],
      isActive: true,
      assignedServiceIds: ['srv-farm-tour', 'srv-training-masterclass', 'srv-wholesale-procure', 'srv-compost-advisory']
    }
  ],
  appointments: [
    {
      id: 'apt-sample-01',
      referenceCode: 'SLM-8491',
      serviceId: 'srv-farm-tour',
      serviceName: 'Commercial Farm Tour & Facility Walkthrough',
      servicePrice: 350,
      staffId: 'stf-manjunath-k',
      staffName: 'Manjunath K.',
      date: '2026-10-27',
      startTime: '10:00',
      endTime: '10:45',
      durationMinutes: 45,
      customerName: 'Suresh Patil',
      customerPhone: '+91 98450 12345',
      customerEmail: 'suresh.patil@example.com',
      customerNotes: 'Visiting from Shimoga town with family to see oyster mushroom chambers.',
      status: 'Confirmed',
      internalNotes: 'VIP visitor interested in starting small 50-bag setup.',
      createdAt: '2026-10-25T11:20:00.000Z',
      updatedAt: '2026-10-25T12:00:00.000Z'
    },
    {
      id: 'apt-sample-02',
      referenceCode: 'SLM-9214',
      serviceId: 'srv-training-masterclass',
      serviceName: 'Hands-on Cultivation Training & Inoculation Masterclass',
      servicePrice: 1500,
      staffId: 'stf-rk-gowda',
      staffName: 'Dr. R. K. Gowda',
      date: '2026-10-28',
      startTime: '14:30',
      endTime: '16:00',
      durationMinutes: 90,
      customerName: 'Anitha Hegde',
      customerPhone: '+91 97412 88990',
      customerEmail: 'anitha.hegde@example.com',
      customerNotes: 'Interested in milky mushroom summer batch cultivation.',
      status: 'Pending',
      internalNotes: 'Requested weekend slot if possible.',
      createdAt: '2026-10-26T07:15:00.000Z',
      updatedAt: '2026-10-26T07:15:00.000Z'
    }
  ],
  gallery: [
    {
      id: 'gal-01',
      title: 'Climate-Controlled Growing Chamber',
      category: 'Facility',
      description: 'Vertical galvanized steel racks with high-density pearl oyster mushroom flushes and automated ultrasonic humidification.',
      imageUrl: '/src/assets/images/hero_mushroom_facility_1793029229491.jpg',
      dateAdded: '2026-10-20',
      isHighlight: true
    },
    {
      id: 'gal-02',
      title: 'Biotechnology Spawn Production Laboratory',
      category: 'Laboratory',
      description: 'Sterile laminar airflow workstations for mother spawn preparation and sorghum grain inoculation.',
      imageUrl: '/src/assets/images/mushroom_spawn_lab_1793029230218.jpg',
      dateAdded: '2026-10-20',
      isHighlight: true
    },
    {
      id: 'gal-03',
      title: 'Fresh Organic Oyster & Milky Harvest',
      category: 'Produce',
      description: 'Hand-picked organic mushrooms ready for same-day local distribution in Shivamogga and Bhadravati.',
      imageUrl: '/src/assets/images/fresh_harvest_produce_1793029231043.jpg',
      dateAdded: '2026-10-21',
      isHighlight: true
    },
    {
      id: 'gal-04',
      title: 'Farmer Training & Workshop Session',
      category: 'Training',
      description: 'On-site technical instruction for local farmers exploring mushroom farming as a sustainable allied agribusiness.',
      imageUrl: '/src/assets/images/agrobusiness_consulting_tour_1793029232226.jpg',
      dateAdded: '2026-10-22',
      isHighlight: true
    },
    {
      id: 'gal-05',
      title: 'Farm Exterior & Agrobusiness Compound',
      category: 'Compound',
      description: 'Panoramic view of our green agrarian campus situated along NH69 near Jannapura, Bhadravati.',
      imageUrl: '/src/assets/images/farm_exterior_storefront_1793029232555.jpg',
      dateAdded: '2026-10-23',
      isHighlight: false
    }
  ],
  reviews: [
    {
      id: 'rev-01',
      author: 'Chandrashekar B.',
      rating: 5,
      date: '2 months ago',
      text: 'Best place in Shivamogga district for authentic mushroom spawn and commercial training. Dr. Gowda explained the humidity requirements and substrate treatment with extreme clarity. My first oyster flush gave 1.4kg per bag!',
      verifiedSource: 'Google Maps Business Profile',
      highlightAspect: 'High-Yield Spawn & Guidance'
    },
    {
      id: 'rev-02',
      author: 'Praveen Kumar',
      rating: 5,
      date: '3 months ago',
      text: 'Visited the Bhadravati facility for our agri-entrepreneur project. The facility is immaculately maintained with modern misting systems. Very genuine team who supports farmers post-training.',
      verifiedSource: 'Google Maps Business Profile',
      highlightAspect: 'Clean Facility & Technical Support'
    },
    {
      id: 'rev-03',
      author: 'Dr. Geetha Rao',
      rating: 5,
      date: '4 months ago',
      text: 'Regularly purchase organic fresh milky mushrooms and mushroom powder from Sri Lakshmi Agrobusiness. Unmatched freshness and chemical-free quality. Highly recommended!',
      verifiedSource: 'Google Maps Business Profile',
      highlightAspect: 'Fresh Organic Produce'
    },
    {
      id: 'rev-04',
      author: 'Venkatesh Murthy',
      rating: 4.8,
      date: '5 months ago',
      text: 'Very professional agrobusiness. They gave us complete insights into NABARD subsidy processes for setting up a 1-ton commercial mushroom unit.',
      verifiedSource: 'Google Maps Business Profile',
      highlightAspect: 'Agrobusiness DPR Advisory'
    }
  ],
  notifications: [
    {
      id: 'notif-01',
      appointmentId: 'apt-sample-01',
      referenceCode: 'SLM-8491',
      recipientType: 'Customer',
      channel: 'WhatsApp',
      event: 'Appointment Confirmed',
      recipient: '+91 98450 12345',
      message: 'Namaskara Suresh Patil, your appointment SLM-8491 for Commercial Farm Tour on 2026-10-27 at 10:00 AM is CONFIRMED at Sri Lakshmi Mushrooms, Bhadravati. Location: https://maps.app.goo.gl/ei7zC4FHozZRQ3pL6',
      status: 'Delivered',
      timestamp: '2026-10-25T12:00:10.000Z'
    },
    {
      id: 'notif-02',
      appointmentId: 'apt-sample-02',
      referenceCode: 'SLM-9214',
      recipientType: 'Business',
      channel: 'WhatsApp',
      event: 'New Booking Request',
      recipient: '+91 94482 17890',
      message: 'New appointment request SLM-9214 received from Anitha Hegde (+91 97412 88990) for Hands-on Cultivation Training on 2026-10-28 at 02:30 PM. Status: Pending approval.',
      status: 'Delivered',
      timestamp: '2026-10-26T07:15:05.000Z'
    }
  ],
  admin: {
    email: 'admin@srilakshmimushrooms.com',
    salt: DEFAULT_SALT,
    passwordHash: hashPassword(DEFAULT_PASSWORD, DEFAULT_SALT)
  }
};

class Database {
  private data: DatabaseSchema;
  private initialized = false;

  constructor() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        // Merge to guarantee all fields exist if schema evolved
        this.data = {
          ...INITIAL_DATA,
          ...parsed,
          business: { ...INITIAL_DATA.business, ...(parsed.business || {}) },
          bookingSettings: { ...INITIAL_DATA.business.bookingSettings, ...(parsed.business?.bookingSettings || {}) }
        };
      } catch (err) {
        console.error('Error reading database file, using fallback initial data:', err);
        this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
        await this.persist();
      }
    } else {
      await this.persist();
    }

    this.initialized = true;
  }

  private async persist(): Promise<void> {
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    const serialized = JSON.stringify(this.data, null, 2);
    await fs.promises.writeFile(tempFile, serialized, 'utf8');
    await fs.promises.rename(tempFile, DB_FILE);
  }

  // --- Business Profile ---
  async getBusinessProfile(): Promise<BusinessProfile> {
    await this.init();
    return JSON.parse(JSON.stringify(this.data.business));
  }

  async updateBusinessProfile(updates: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const release = await dbMutex.acquire();
    try {
      await this.init();
      this.data.business = {
        ...this.data.business,
        ...updates,
        address: {
          ...this.data.business.address,
          ...(updates.address || {})
        },
        operatingHours: {
          ...this.data.business.operatingHours,
          ...(updates.operatingHours || {})
        },
        bookingSettings: {
          ...this.data.business.bookingSettings,
          ...(updates.bookingSettings || {})
        },
        branding: {
          ...this.data.business.branding,
          ...(updates.branding || {})
        }
      };
      await this.persist();
      return JSON.parse(JSON.stringify(this.data.business));
    } finally {
      release();
    }
  }

  // --- Services ---
  async getServices(activeOnly = true): Promise<Service[]> {
    await this.init();
    const list = this.data.services;
    return activeOnly ? list.filter((s) => s.isActive) : [...list];
  }

  async getServiceById(id: string): Promise<Service | undefined> {
    await this.init();
    return this.data.services.find((s) => s.id === id);
  }

  async saveService(service: Partial<Service> & { name: string; durationMinutes: number; price: number }): Promise<Service> {
    const release = await dbMutex.acquire();
    try {
      await this.init();
      if (service.id) {
        const index = this.data.services.findIndex((s) => s.id === service.id);
        if (index !== -1) {
          this.data.services[index] = {
            ...this.data.services[index],
            ...service
          } as Service;
          await this.persist();
          return this.data.services[index];
        }
      }

      const newService: Service = {
        id: service.id || `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: service.name,
        shortDescription: service.shortDescription || '',
        fullDescription: service.fullDescription || '',
        category: service.category || 'Mushroom Cultivation',
        durationMinutes: service.durationMinutes,
        price: service.price,
        isPriceFrom: !!service.isPriceFrom,
        isFree: !!service.isFree,
        isActive: service.isActive !== undefined ? service.isActive : true,
        imageUrl: service.imageUrl || '/src/assets/images/hero_mushroom_facility_1793029229491.jpg',
        deliverables: service.deliverables || [],
        maxGroupSize: service.maxGroupSize || 6
      };
      this.data.services.push(newService);
      await this.persist();
      return newService;
    } finally {
      release();
    }
  }

  async deleteService(id: string): Promise<boolean> {
    const release = await dbMutex.acquire();
    try {
      await this.init();
      const initialLen = this.data.services.length;
      this.data.services = this.data.services.filter((s) => s.id !== id);
      if (this.data.services.length !== initialLen) {
        await this.persist();
        return true;
      }
      return false;
    } finally {
      release();
    }
  }

  // --- Staff ---
  async getStaff(activeOnly = true): Promise<StaffMember[]> {
    await this.init();
    const list = this.data.staff;
    return activeOnly ? list.filter((s) => s.isActive) : [...list];
  }

  async saveStaff(staff: Partial<StaffMember> & { name: string; role: string }): Promise<StaffMember> {
    const release = await dbMutex.acquire();
    try {
      await this.init();
      if (staff.id) {
        const idx = this.data.staff.findIndex((s) => s.id === staff.id);
        if (idx !== -1) {
          this.data.staff[idx] = { ...this.data.staff[idx], ...staff } as StaffMember;
          await this.persist();
          return this.data.staff[idx];
        }
      }
      const newStaff: StaffMember = {
        id: staff.id || `stf-${Date.now()}`,
        name: staff.name,
        role: staff.role,
        bio: staff.bio || '',
        specialties: staff.specialties || [],
        avatarUrl: staff.avatarUrl,
        isActive: staff.isActive !== undefined ? staff.isActive : true,
        assignedServiceIds: staff.assignedServiceIds || []
      };
      this.data.staff.push(newStaff);
      await this.persist();
      return newStaff;
    } finally {
      release();
    }
  }

  async deleteStaff(id: string): Promise<boolean> {
    const release = await dbMutex.acquire();
    try {
      await this.init();
      const initialLen = this.data.staff.length;
      this.data.staff = this.data.staff.filter((s) => s.id !== id);
      if (this.data.staff.length !== initialLen) {
        await this.persist();
        return true;
      }
      return false;
    } finally {
      release();
    }
  }

  // --- Availability Logic (Zero Double-Booking Guarantee) ---
  async calculateAvailableSlots(params: {
    date: string; // YYYY-MM-DD
    serviceId: string;
    staffId?: string;
  }): Promise<{ slots: AvailableTimeSlot[]; reason?: string }> {
    await this.init();
    const { date, serviceId, staffId } = params;

    const service = this.data.services.find((s) => s.id === serviceId);
    if (!service || !service.isActive) {
      return { slots: [], reason: 'Service is currently unavailable or inactive.' };
    }

    const bookingSettings = this.data.business.bookingSettings;
    const requestedDateObj = new Date(`${date}T00:00:00Z`);
    const today = new Date();
    // Normalize today in UTC for date comparisons
    const todayStr = today.toISOString().split('T')[0];

    // Check maximum advance booking window
    const maxDaysAhead = new Date();
    maxDaysAhead.setDate(maxDaysAhead.getDate() + bookingSettings.maxAdvanceDays);
    const maxDateStr = maxDaysAhead.toISOString().split('T')[0];

    if (date < todayStr) {
      return { slots: [], reason: 'Cannot book dates in the past.' };
    }
    if (date > maxDateStr) {
      return { slots: [], reason: `Bookings are only accepted up to ${bookingSettings.maxAdvanceDays} days in advance.` };
    }

    // Check blocked dates
    const blocked = this.data.business.blockedDates.find((b) => b.date === date);
    if (blocked && blocked.allDay) {
      return { slots: [], reason: `Farm is closed on this date (${blocked.reason || 'Blocked by administration'}).` };
    }

    // Determine Day of Week
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // Parse target local day of week
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = days[localDate.getDay()];

    const schedule = this.data.business.operatingHours[dayOfWeek];
    if (!schedule || !schedule.isOpen) {
      return { slots: [], reason: `We are closed on ${dayOfWeek}s.` };
    }

    // Operating hours
    const [openH, openM] = schedule.openTime.split(':').map(Number);
    const [closeH, closeM] = schedule.closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const duration = service.durationMinutes;
    const buffer = bookingSettings.bufferMinutes || 0;
    const step = 30; // 30-minute interval grid

    // Fetch existing active appointments on this date
    const existing = this.data.appointments.filter(
      (a) =>
        a.date === date &&
        a.status !== 'Cancelled' &&
        a.status !== 'Rejected' &&
        (!staffId || staffId === 'any' || !a.staffId || a.staffId === staffId)
    );

    // Compute current time in Asia/Kolkata
    const nowKolkata = new Intl.DateTimeFormat('en-US', {
      timeZone: this.data.business.timezone || 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).formatToParts(new Date());

    const partMap: Record<string, string> = {};
    nowKolkata.forEach((p) => {
      partMap[p.type] = p.value;
    });

    const kolkataYear = Number(partMap.year);
    const kolkataMonth = String(partMap.month).padStart(2, '0');
    const kolkataDay = String(partMap.day).padStart(2, '0');
    const kolkataDateStr = `${kolkataYear}-${kolkataMonth}-${kolkataDay}`;
    const kolkataCurrentMinutes = Number(partMap.hour) * 60 + Number(partMap.minute);
    const minNoticeMinutes = (bookingSettings.minNoticeHours || 0) * 60;

    const slots: AvailableTimeSlot[] = [];

    for (let m = openMinutes; m + duration <= closeMinutes; m += step) {
      const slotHour = Math.floor(m / 60);
      const slotMin = m % 60;
      const timeStr = `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`;
      const endM = m + duration;
      const endHour = Math.floor(endM / 60);
      const endMin = endM % 60;
      const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

      // Format display time
      const period = slotHour >= 12 ? 'PM' : 'AM';
      const displayHour = slotHour % 12 === 0 ? 12 : slotHour % 12;
      const displayTime = `${displayHour}:${String(slotMin).padStart(2, '0')} ${period}`;

      let available = true;
      let reason: string | undefined = undefined;

      // Notice time check if booking for today
      if (date === kolkataDateStr) {
        if (m < kolkataCurrentMinutes + minNoticeMinutes) {
          available = false;
          reason = `Requires minimum ${bookingSettings.minNoticeHours}h advance notice.`;
        }
      }

      // Check partial blocked date hours
      if (available && blocked && !blocked.allDay && blocked.startTime && blocked.endTime) {
        const [bStartH, bStartM] = blocked.startTime.split(':').map(Number);
        const [bEndH, bEndM] = blocked.endTime.split(':').map(Number);
        const bStart = bStartH * 60 + bStartM;
        const bEnd = bEndH * 60 + bEndM;
        if (m < bEnd && endM > bStart) {
          available = false;
          reason = `Blocked by administration (${blocked.reason}).`;
        }
      }

      // Check collision with existing appointments (with buffer)
      if (available) {
        for (const app of existing) {
          const [appStartH, appStartM] = app.startTime.split(':').map(Number);
          const [appEndH, appEndM] = app.endTime.split(':').map(Number);
          const appStart = appStartH * 60 + appStartM;
          // Apply buffer to appointment window
          const appEndWithBuffer = appEndH * 60 + appEndM + buffer;
          const appStartWithBuffer = Math.max(0, appStart - buffer);

          // Overlap condition:
          if (m < appEndWithBuffer && endM > appStartWithBuffer) {
            available = false;
            reason = 'Time slot already reserved.';
            break;
          }
        }
      }

      slots.push({
        time: timeStr,
        displayTime,
        available,
        reason
      });
    }

    return { slots };
  }

  // --- Appointments Management ---
  async getAppointments(filters?: {
    status?: string;
    search?: string;
    date?: string;
    serviceId?: string;
  }): Promise<Appointment[]> {
    await this.init();
    let list = [...this.data.appointments];

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.serviceId && filters.serviceId !== 'all') {
      list = list.filter((a) => a.serviceId === filters.serviceId);
    }
    if (filters?.date) {
      list = list.filter((a) => a.date === filters.date);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.referenceCode.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.customerPhone.includes(q) ||
          a.customerEmail.toLowerCase().includes(q) ||
          a.serviceName.toLowerCase().includes(q)
      );
    }

    // Sort by date and start time descending (newest first)
    list.sort((a, b) => {
      const dtA = `${a.date}T${a.startTime}`;
      const dtB = `${b.date}T${b.startTime}`;
      return dtB.localeCompare(dtA);
    });

    return list;
  }

  async getAppointmentByReference(referenceCode: string): Promise<Appointment | undefined> {
    await this.init();
    const cleanRef = referenceCode.trim().toUpperCase();
    return this.data.appointments.find((a) => a.referenceCode === cleanRef);
  }

  // Atomic creation of appointment with mutex lock and backend recheck
  async createAppointment(input: {
    serviceId: string;
    staffId?: string;
    date: string;
    startTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerNotes?: string;
  }): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    const release = await dbMutex.acquire();
    try {
      await this.init();

      // Validate service
      const service = this.data.services.find((s) => s.id === input.serviceId && s.isActive);
      if (!service) {
        return { success: false, error: 'The requested service is invalid or unavailable.' };
      }

      // Re-verify availability strictly under mutex
      const availability = await this.calculateAvailableSlots({
        date: input.date,
        serviceId: input.serviceId,
        staffId: input.staffId
      });

      const matchingSlot = availability.slots.find((s) => s.time === input.startTime);
      if (!matchingSlot || !matchingSlot.available) {
        return {
          success: false,
          error: matchingSlot?.reason || 'The selected time slot is no longer available. Please select another time.'
        };
      }

      // Calculate end time
      const [startH, startM] = input.startTime.split(':').map(Number);
      const endTotalM = startH * 60 + startM + service.durationMinutes;
      const endH = Math.floor(endTotalM / 60);
      const endM = endTotalM % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      // Staff details
      let staffName: string | undefined = undefined;
      if (input.staffId && input.staffId !== 'any') {
        const staff = this.data.staff.find((st) => st.id === input.staffId);
        staffName = staff?.name;
      }

      // Generate human-friendly unique reference code e.g. SLM-7294
      let referenceCode = '';
      let isUnique = false;
      while (!isUnique) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        referenceCode = `SLM-${randomNum}`;
        if (!this.data.appointments.some((a) => a.referenceCode === referenceCode)) {
          isUnique = true;
        }
      }

      const initialStatus = this.data.business.bookingSettings.autoConfirm ? 'Confirmed' : 'Pending';

      const appointment: Appointment = {
        id: `apt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        referenceCode,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        staffId: input.staffId !== 'any' ? input.staffId : undefined,
        staffName,
        date: input.date,
        startTime: input.startTime,
        endTime,
        durationMinutes: service.durationMinutes,
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone.trim(),
        customerEmail: (input.customerEmail || '').trim(),
        customerNotes: (input.customerNotes || '').trim(),
        status: initialStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.data.appointments.push(appointment);

      // Create notification records
      const notifCustomer: NotificationLog = {
        id: `notif-${Date.now()}-1`,
        appointmentId: appointment.id,
        referenceCode: appointment.referenceCode,
        recipientType: 'Customer',
        channel: 'WhatsApp',
        event: initialStatus === 'Confirmed' ? 'Appointment Confirmed' : 'Booking Request Received',
        recipient: appointment.customerPhone,
        message:
          initialStatus === 'Confirmed'
            ? `Namaskara ${appointment.customerName}, your appointment ${appointment.referenceCode} for ${appointment.serviceName} on ${appointment.date} at ${appointment.startTime} has been CONFIRMED. Location: ${this.data.business.googleMapsUrl}`
            : `Namaskara ${appointment.customerName}, we have received your booking request ${appointment.referenceCode} for ${appointment.serviceName} on ${appointment.date} at ${appointment.startTime}. Our team will review and confirm shortly.`,
        status: 'Delivered',
        timestamp: new Date().toISOString()
      };

      const notifOwner: NotificationLog = {
        id: `notif-${Date.now()}-2`,
        appointmentId: appointment.id,
        referenceCode: appointment.referenceCode,
        recipientType: 'Business',
        channel: 'WhatsApp',
        event: 'New Booking Alert',
        recipient: this.data.business.whatsapp || this.data.business.phone,
        message: `New booking: ${appointment.referenceCode} by ${appointment.customerName} (${appointment.customerPhone}) for ${appointment.serviceName} on ${appointment.date} at ${appointment.startTime}.`,
        status: 'Delivered',
        timestamp: new Date().toISOString()
      };

      this.data.notifications.unshift(notifCustomer, notifOwner);
      await this.persist();

      return { success: true, appointment };
    } finally {
      release();
    }
  }

  async updateAppointmentStatus(
    id: string,
    updates: {
      status?: AppointmentStatus;
      internalNotes?: string;
      statusReason?: string;
      date?: string;
      startTime?: string;
      staffId?: string;
    }
  ): Promise<Appointment | undefined> {
    const release = await dbMutex.acquire();
    try {
      await this.init();
      const index = this.data.appointments.findIndex((a) => a.id === id);
      if (index === -1) return undefined;

      const current = this.data.appointments[index];
      const previousStatus = current.status;

      let endTime = current.endTime;
      if (updates.startTime) {
        const [startH, startM] = updates.startTime.split(':').map(Number);
        const endTotal = startH * 60 + startM + current.durationMinutes;
        endTime = `${String(Math.floor(endTotal / 60)).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;
      }

      let staffName = current.staffName;
      if (updates.staffId) {
        const staff = this.data.staff.find((st) => st.id === updates.staffId);
        staffName = staff ? staff.name : undefined;
      }

      const cleanUpdates: Record<string, any> = {};
      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined && val !== null) {
          cleanUpdates[key] = val;
        }
      }

      const updated: Appointment = {
        ...current,
        ...cleanUpdates,
        endTime,
        staffName,
        updatedAt: new Date().toISOString()
      };

      this.data.appointments[index] = updated;

      // Log notification if status changed
      if (updates.status && updates.status !== previousStatus) {
        const notif: NotificationLog = {
          id: `notif-${Date.now()}`,
          appointmentId: updated.id,
          referenceCode: updated.referenceCode,
          recipientType: 'Customer',
          channel: 'WhatsApp',
          event: `Status: ${updates.status}`,
          recipient: updated.customerPhone,
          message: `Update for appointment ${updated.referenceCode}: Your booking has been marked as ${updates.status.toUpperCase()}. ${updates.statusReason || ''}`,
          status: 'Delivered',
          timestamp: new Date().toISOString()
        };
        this.data.notifications.unshift(notif);
      }

      await this.persist();
      return updated;
    } finally {
      release();
    }
  }

  // --- Customers Overview ---
  async getCustomers(): Promise<
    {
      phone: string;
      name: string;
      email: string;
      totalBookings: number;
      lastVisit: string;
      bookings: Appointment[];
    }[]
  > {
    await this.init();
    const map = new Map<
      string,
      {
        phone: string;
        name: string;
        email: string;
        totalBookings: number;
        lastVisit: string;
        bookings: Appointment[];
      }
    >();

    for (const a of this.data.appointments) {
      const key = a.customerPhone;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          phone: a.customerPhone,
          name: a.customerName,
          email: a.customerEmail,
          totalBookings: 1,
          lastVisit: a.date,
          bookings: [a]
        });
      } else {
        existing.totalBookings += 1;
        if (a.date > existing.lastVisit) {
          existing.lastVisit = a.date;
        }
        existing.bookings.push(a);
      }
    }

    return Array.from(map.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
  }

  // --- Gallery & Reviews ---
  async getGallery(): Promise<GalleryItem[]> {
    await this.init();
    return [...this.data.gallery];
  }

  async saveGalleryItem(item: Partial<GalleryItem> & { title: string; imageUrl: string }): Promise<GalleryItem> {
    const release = await dbMutex.acquire();
    try {
      await this.init();
      if (item.id) {
        const idx = this.data.gallery.findIndex((g) => g.id === item.id);
        if (idx !== -1) {
          this.data.gallery[idx] = { ...this.data.gallery[idx], ...item } as GalleryItem;
          await this.persist();
          return this.data.gallery[idx];
        }
      }
      const newItem: GalleryItem = {
        id: item.id || `gal-${Date.now()}`,
        title: item.title,
        category: item.category || 'Farm',
        description: item.description || '',
        imageUrl: item.imageUrl,
        dateAdded: new Date().toISOString().split('T')[0],
        isHighlight: item.isHighlight ?? false
      };
      this.data.gallery.push(newItem);
      await this.persist();
      return newItem;
    } finally {
      release();
    }
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    const release = await dbMutex.acquire();
    try {
      await this.init();
      const prev = this.data.gallery.length;
      this.data.gallery = this.data.gallery.filter((g) => g.id !== id);
      if (this.data.gallery.length !== prev) {
        await this.persist();
        return true;
      }
      return false;
    } finally {
      release();
    }
  }

  async getReviews(): Promise<ReviewItem[]> {
    await this.init();
    return [...this.data.reviews];
  }

  async getNotifications(): Promise<NotificationLog[]> {
    await this.init();
    return this.data.notifications.slice(0, 100);
  }

  // --- Admin Authentication ---
  async verifyAdminPassword(password: string): Promise<boolean> {
    await this.init();
    const hash = hashPassword(password, this.data.admin.salt);
    return hash === this.data.admin.passwordHash;
  }

  async changeAdminPassword(newPassword: string): Promise<boolean> {
    const release = await dbMutex.acquire();
    try {
      await this.init();
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(newPassword, salt);
      this.data.admin.salt = salt;
      this.data.admin.passwordHash = passwordHash;
      await this.persist();
      return true;
    } finally {
      release();
    }
  }

  async getAdminEmail(): Promise<string> {
    await this.init();
    return this.data.admin.email;
  }
}

export const db = new Database();
