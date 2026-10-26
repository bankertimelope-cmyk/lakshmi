import type {
  BusinessProfile,
  Service,
  StaffMember,
  Appointment,
  GalleryItem,
  ReviewItem,
  NotificationLog,
  AvailableTimeSlot
} from '../types/index.ts';

const API_BASE = '/api';

function getAdminToken(): string | null {
  return localStorage.getItem('slm_admin_token');
}

export function setAdminToken(token: string | null): void {
  if (token) {
    localStorage.setItem('slm_admin_token', token);
  } else {
    localStorage.removeItem('slm_admin_token');
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected network error occurred.';
    try {
      const errJson = await res.json();
      errorMsg = errJson.error || errorMsg;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Public APIs
  async getBusinessProfile(): Promise<BusinessProfile> {
    const res = await fetch(`${API_BASE}/business`);
    return handleResponse<BusinessProfile>(res);
  },

  async getServices(): Promise<Service[]> {
    const res = await fetch(`${API_BASE}/services`);
    return handleResponse<Service[]>(res);
  },

  async getStaff(): Promise<StaffMember[]> {
    const res = await fetch(`${API_BASE}/staff`);
    return handleResponse<StaffMember[]>(res);
  },

  async getGallery(): Promise<GalleryItem[]> {
    const res = await fetch(`${API_BASE}/gallery`);
    return handleResponse<GalleryItem[]>(res);
  },

  async getReviews(): Promise<ReviewItem[]> {
    const res = await fetch(`${API_BASE}/reviews`);
    return handleResponse<ReviewItem[]>(res);
  },

  async getAvailability(params: {
    date: string;
    serviceId: string;
    staffId?: string;
  }): Promise<{ slots: AvailableTimeSlot[]; reason?: string }> {
    const query = new URLSearchParams({
      date: params.date,
      serviceId: params.serviceId,
      ...(params.staffId ? { staffId: params.staffId } : {})
    });
    const res = await fetch(`${API_BASE}/availability?${query.toString()}`);
    return handleResponse<{ slots: AvailableTimeSlot[]; reason?: string }>(res);
  },

  async createAppointment(data: {
    serviceId: string;
    staffId?: string;
    date: string;
    startTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerNotes?: string;
  }): Promise<{ success: boolean; appointment: Appointment }> {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; appointment: Appointment }>(res);
  },

  async getAppointmentByReference(reference: string): Promise<Partial<Appointment>> {
    const res = await fetch(`${API_BASE}/appointments/${encodeURIComponent(reference)}`);
    return handleResponse<Partial<Appointment>>(res);
  },

  async cancelAppointment(reference: string, phone: string): Promise<{ success: boolean; appointment: Appointment }> {
    const res = await fetch(`${API_BASE}/appointments/${encodeURIComponent(reference)}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return handleResponse<{ success: boolean; appointment: Appointment }>(res);
  },

  // Admin APIs
  async adminLogin(email: string, password: string): Promise<{ success: boolean; token: string }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse<{ success: boolean; token: string }>(res);
    setAdminToken(data.token);
    return data;
  },

  async adminLogout(): Promise<void> {
    const token = getAdminToken();
    if (token) {
      await fetch(`${API_BASE}/admin/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    setAdminToken(null);
  },

  async adminCheck(): Promise<{ authenticated: boolean; email: string }> {
    const token = getAdminToken();
    if (!token) throw new Error('Not logged in');
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse<{ authenticated: boolean; email: string }>(res);
  },

  async adminChangePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async adminUpdateBusiness(updates: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/business`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    return handleResponse<BusinessProfile>(res);
  },

  async adminGetAppointments(filters?: {
    status?: string;
    search?: string;
    date?: string;
    serviceId?: string;
  }): Promise<Appointment[]> {
    const token = getAdminToken();
    const query = new URLSearchParams();
    if (filters?.status) query.set('status', filters.status);
    if (filters?.search) query.set('search', filters.search);
    if (filters?.date) query.set('date', filters.date);
    if (filters?.serviceId) query.set('serviceId', filters.serviceId);

    const res = await fetch(`${API_BASE}/admin/appointments?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse<Appointment[]>(res);
  },

  async adminUpdateAppointment(
    id: string,
    updates: {
      status?: string;
      internalNotes?: string;
      statusReason?: string;
      date?: string;
      startTime?: string;
      staffId?: string;
    }
  ): Promise<Appointment> {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    return handleResponse<Appointment>(res);
  },

  async adminGetServices(): Promise<Service[]> {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/services`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse<Service[]>(res);
  },

  async adminSaveService(service: Partial<Service>): Promise<Service> {
    const token = getAdminToken();
    const method = service.id ? 'PUT' : 'POST';
    const url = service.id ? `${API_BASE}/admin/services/${service.id}` : `${API_BASE}/admin/services`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(service)
    });
    return handleResponse<Service>(res);
  },

  async adminDeleteService(id: string): Promise<{ success: boolean }> {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async adminGetStaff(): Promise<StaffMember[]> {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/staff`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse<StaffMember[]>(res);
  },

  async adminSaveStaff(staff: Partial<StaffMember>): Promise<StaffMember> {
    const token = getAdminToken();
    const method = staff.id ? 'PUT' : 'POST';
    const url = staff.id ? `${API_BASE}/admin/staff/${staff.id}` : `${API_BASE}/admin/staff`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(staff)
    });
    return handleResponse<StaffMember>(res);
  },

  async adminDeleteStaff(id: string): Promise<{ success: boolean }> {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/staff/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async adminSaveGallery(item: Partial<GalleryItem>): Promise<GalleryItem> {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(item)
    });
    return handleResponse<GalleryItem>(res);
  },

  async adminDeleteGallery(id: string): Promise<{ success: boolean }> {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async adminGetCustomers(): Promise<any[]> {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse<any[]>(res);
  },

  async adminGetNotifications(): Promise<NotificationLog[]> {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse<NotificationLog[]>(res);
  },

  async adminExportCsvUrl(): Promise<string> {
    const token = getAdminToken();
    // Return direct download url or trigger fetch blob
    const res = await fetch(`${API_BASE}/admin/export`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to download CSV');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }
};
