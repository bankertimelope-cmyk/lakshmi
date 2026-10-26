import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  Settings,
  Users,
  Download,
  Bell,
  Lock,
  LogOut,
  Search,
  Check,
  Ban,
  Clock,
  Phone,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api, setAdminToken } from '../../services/api.ts';
import type {
  Appointment,
  BusinessProfile,
  Service,
  StaffMember,
  NotificationLog,
  AppointmentStatus,
  DayOfWeek
} from '../../types/index.ts';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessProfile | null;
  onBusinessUpdated: (updated: BusinessProfile) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  business,
  onBusinessUpdated
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Login form
  const [loginEmail, setLoginEmail] = useState('admin@srilakshmimushrooms.com');
  const [loginPassword, setLoginPassword] = useState('FarmAdmin2026!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'appointments' | 'services' | 'settings' | 'staff' | 'customers' | 'notifications'
  >('overview');

  // Data states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters for appointments
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // Modal for editing appointment
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [internalNoteText, setInternalNoteText] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Service form modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  // Staff form modal
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember> | null>(null);

  // Business settings form
  const [settingsForm, setSettingsForm] = useState<BusinessProfile | null>(business);

  // Password change form
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    if (!isOpen) return;
    setAuthChecking(true);
    api
      .adminCheck()
      .then(() => {
        setIsAuthenticated(true);
        loadAllData();
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, [isOpen]);

  useEffect(() => {
    if (business) {
      setSettingsForm(business);
    }
  }, [business]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [appts, srvs, stf, custs, notifs] = await Promise.all([
        api.adminGetAppointments(),
        api.adminGetServices(),
        api.adminGetStaff(),
        api.adminGetCustomers(),
        api.adminGetNotifications()
      ]);
      setAppointments(appts);
      setServices(srvs);
      setStaff(stf);
      setCustomers(custs);
      setNotifications(notifs);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await api.adminLogin(loginEmail, loginPassword);
      setIsAuthenticated(true);
      await loadAllData();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.adminLogout();
    setIsAuthenticated(false);
  };

  // Appointment status updates
  const handleUpdateStatus = async (id: string, status: AppointmentStatus, reason?: string) => {
    try {
      const updated = await api.adminUpdateAppointment(id, {
        status,
        statusReason: reason
      });
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setActionSuccess(`Appointment marked as ${status}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleSaveInternalNote = async (id: string) => {
    try {
      const updated = await api.adminUpdateAppointment(id, {
        internalNotes: internalNoteText
      });
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setEditingAppointment(null);
      setActionSuccess('Internal note saved.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving note');
    }
  };

  const handleReschedule = async (id: string) => {
    if (!rescheduleDate || !rescheduleTime) {
      alert('Please specify both date and time slot.');
      return;
    }
    try {
      const updated = await api.adminUpdateAppointment(id, {
        date: rescheduleDate,
        startTime: rescheduleTime,
        statusReason: `Rescheduled by administration to ${rescheduleDate} at ${rescheduleTime}`
      });
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setEditingAppointment(null);
      setActionSuccess('Appointment rescheduled successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error rescheduling appointment');
    }
  };

  // Services CRUD
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name) return;
    try {
      const saved = await api.adminSaveService(editingService);
      setServices((prev) => {
        const idx = prev.findIndex((s) => s.id === saved.id);
        if (idx !== -1) {
          const list = [...prev];
          list[idx] = saved;
          return list;
        }
        return [...prev, saved];
      });
      setServiceModalOpen(false);
      setEditingService(null);
      setActionSuccess('Service updated successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service?')) return;
    try {
      await api.adminDeleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setActionSuccess('Service deleted.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error deleting service');
    }
  };

  // Staff CRUD
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff?.name || !editingStaff?.role) return;
    try {
      const saved = await api.adminSaveStaff(editingStaff);
      setStaff((prev) => {
        const idx = prev.findIndex((s) => s.id === saved.id);
        if (idx !== -1) {
          const list = [...prev];
          list[idx] = saved;
          return list;
        }
        return [...prev, saved];
      });
      setStaffModalOpen(false);
      setEditingStaff(null);
      setActionSuccess('Staff profile saved.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving staff');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff profile?')) return;
    try {
      await api.adminDeleteStaff(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
      setActionSuccess('Staff profile removed.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error deleting staff');
    }
  };

  // Business settings save
  const handleSaveBusinessSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      const updated = await api.adminUpdateBusiness(settingsForm);
      onBusinessUpdated(updated);
      setActionSuccess('Business settings updated successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating settings');
    }
  };

  // CSV Export
  const handleExportCsv = async () => {
    try {
      const downloadUrl = await api.adminExportCsvUrl();
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `sri_lakshmi_mushrooms_appointments_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Export error');
    }
  };

  // Password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    try {
      await api.adminChangePassword(currentPw, newPw);
      setChangePwOpen(false);
      setCurrentPw('');
      setNewPw('');
      setActionSuccess('Password updated successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setPwError(err.message || 'Failed to change password');
    }
  };

  if (!isOpen) return null;

  // Filtered appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchService = serviceFilter === 'all' || a.serviceId === serviceFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      a.referenceCode.toLowerCase().includes(q) ||
      a.customerName.toLowerCase().includes(q) ||
      a.customerPhone.includes(q) ||
      a.serviceName.toLowerCase().includes(q);
    return matchStatus && matchService && matchSearch;
  });

  // KPI Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter((a) => a.date === todayStr && a.status !== 'Cancelled').length;
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'Confirmed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'Cancelled').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-6xl h-[94vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
              SL
            </div>
            <div>
              <h3 className="font-display font-bold text-base leading-tight">
                Sri Lakshmi Mushrooms Administration
              </h3>
              <p className="text-[11px] text-stone-400">
                Official Business Management & Booking Dispatch Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setChangePwOpen(true)}
                  className="px-3 py-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Security</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs text-stone-300 hover:text-red-400 bg-stone-800 hover:bg-stone-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action toast message */}
        {actionSuccess && (
          <div className="bg-emerald-800 text-white text-xs px-6 py-2 flex items-center gap-2 font-medium shrink-0 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Login State */}
        {!isAuthenticated ? (
          <div className="flex-1 p-6 sm:p-12 flex items-center justify-center bg-[#FAFAF7] overflow-y-auto">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone-200 shadow-lg space-y-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="font-display font-bold text-xl text-stone-900">
                  Business Owner Login
                </h4>
                <p className="text-xs text-stone-500">
                  Authorized access for Sri Lakshmi Mushrooms administrators.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div className="p-3 bg-stone-100 rounded-lg text-[11px] text-stone-600 space-y-1">
                  <p className="font-semibold text-stone-800">Initial Setup Credentials:</p>
                  <p>Email: <code className="font-mono bg-white px-1 py-0.5 rounded">admin@srilakshmimushrooms.com</code></p>
                  <p>Password: <code className="font-mono bg-white px-1 py-0.5 rounded">FarmAdmin2026!</code></p>
                  <p className="text-stone-500 italic mt-1">* Password can be updated anytime in Dashboard Security settings.</p>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loginLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-60 bg-stone-50 border-r border-stone-200 p-3 flex md:flex-col justify-between overflow-x-auto md:overflow-y-auto shrink-0 space-y-1">
              <div className="flex md:flex-col gap-1 w-full">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'appointments'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarCheck className="w-4 h-4 shrink-0" />
                    <span>Appointments</span>
                  </div>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-stone-950 rounded-full tabular-nums">
                      {pendingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'services'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>Services & Fees</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Farm Settings</span>
                </button>

                <button
                  onClick={() => setActiveTab('staff')}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'staff'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Staff & Guides</span>
                </button>

                <button
                  onClick={() => setActiveTab('customers')}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'customers'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Customers</span>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'notifications'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <Bell className="w-4 h-4 shrink-0" />
                  <span>Notification Logs</span>
                </button>
              </div>

              <div className="hidden md:block pt-4 border-t border-stone-200 space-y-2">
                <button
                  onClick={handleExportCsv}
                  className="w-full px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-800" />
                  <span>Export CSV</span>
                </button>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 overflow-y-auto bg-white space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-display font-bold text-xl text-stone-900">
                        Operational Dashboard
                      </h4>
                      <p className="text-xs text-stone-500">
                        Live status for Sri Lakshmi Mushrooms And Agrobusiness Pvt Ltd
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={loadAllData}
                        className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                      <button
                        onClick={handleExportCsv}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        Today's Visits
                      </span>
                      <p className="font-display text-3xl font-bold text-stone-900 tabular-nums">
                        {todayCount}
                      </p>
                      <p className="text-[11px] text-stone-400">Scheduled for today ({todayStr})</p>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                      <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                        Pending Approvals
                      </span>
                      <p className="font-display text-3xl font-bold text-amber-900 tabular-nums">
                        {pendingCount}
                      </p>
                      <p className="text-[11px] text-amber-700">Awaiting coordinator review</p>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                      <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                        Confirmed Bookings
                      </span>
                      <p className="font-display text-3xl font-bold text-emerald-900 tabular-nums">
                        {confirmedCount}
                      </p>
                      <p className="text-[11px] text-emerald-700">Ready for farm dispatch</p>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        Total Customers
                      </span>
                      <p className="font-display text-3xl font-bold text-stone-900 tabular-nums">
                        {customers.length}
                      </p>
                      <p className="text-[11px] text-stone-400">Unique visitors recorded</p>
                    </div>
                  </div>

                  {/* Pending Action Required Banner */}
                  {pendingCount > 0 && (
                    <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-900">
                            {pendingCount} Pending Appointment Requests Need Action
                          </p>
                          <p className="text-[11px] text-amber-700">
                            Manual approval is active. Customers receive WhatsApp confirmations upon your approval.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setStatusFilter('Pending');
                          setActiveTab('appointments');
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-md whitespace-nowrap cursor-pointer"
                      >
                        Review Requests
                      </button>
                    </div>
                  )}

                  {/* Recent Activity Table */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-sm text-stone-900">
                      Recent Appointments & Visitors
                    </h5>
                    <div className="border border-stone-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                          <tr>
                            <th className="p-3 font-semibold">Ref Code</th>
                            <th className="p-3 font-semibold">Customer</th>
                            <th className="p-3 font-semibold">Service</th>
                            <th className="p-3 font-semibold">Date & Time</th>
                            <th className="p-3 font-semibold">Status</th>
                            <th className="p-3 font-semibold text-right">Quick Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {appointments.slice(0, 5).map((a) => (
                            <tr key={a.id} className="hover:bg-stone-50/50">
                              <td className="p-3 font-mono font-bold text-stone-900">
                                {a.referenceCode}
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-stone-900">{a.customerName}</div>
                                <div className="text-[11px] text-stone-500">{a.customerPhone}</div>
                              </td>
                              <td className="p-3 text-stone-700">{a.serviceName}</td>
                              <td className="p-3 tabular-nums text-stone-600">
                                {a.date} at {a.startTime}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                    a.status === 'Confirmed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : a.status === 'Pending'
                                      ? 'bg-amber-100 text-amber-800'
                                      : a.status === 'Cancelled'
                                      ? 'bg-stone-200 text-stone-600'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {a.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {a.status === 'Pending' ? (
                                  <button
                                    onClick={() => handleUpdateStatus(a.id, 'Confirmed')}
                                    className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingAppointment(a);
                                      setInternalNoteText(a.internalNotes || '');
                                      setRescheduleDate(a.date);
                                      setRescheduleTime(a.startTime);
                                    }}
                                    className="text-stone-500 hover:text-stone-900 font-semibold cursor-pointer"
                                  >
                                    Manage
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: APPOINTMENTS MANAGEMENT */}
              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-display font-bold text-xl text-stone-900">
                        Appointment Management
                      </h4>
                      <p className="text-xs text-stone-500">
                        Filter, confirm, reject, reschedule, or add internal notes.
                      </p>
                    </div>

                    <button
                      onClick={handleExportCsv}
                      className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Download CSV</span>
                    </button>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search ref, name, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none"
                      >
                        <option value="all">All Statuses ({appointments.length})</option>
                        <option value="Pending">Pending ({pendingCount})</option>
                        <option value="Confirmed">Confirmed ({confirmedCount})</option>
                        <option value="Cancelled">Cancelled ({cancelledCount})</option>
                        <option value="Completed">Completed</option>
                        <option value="No-show">No-show</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none"
                      >
                        <option value="all">All Services</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Appointments Table */}
                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                          <tr>
                            <th className="p-3 font-semibold">Reference</th>
                            <th className="p-3 font-semibold">Date & Time</th>
                            <th className="p-3 font-semibold">Customer Details</th>
                            <th className="p-3 font-semibold">Service & Fee</th>
                            <th className="p-3 font-semibold">Assigned Specialist</th>
                            <th className="p-3 font-semibold">Status</th>
                            <th className="p-3 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredAppointments.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-stone-400">
                                No appointments found matching current filters.
                              </td>
                            </tr>
                          ) : (
                            filteredAppointments.map((a) => (
                              <tr key={a.id} className="hover:bg-stone-50/60">
                                <td className="p-3">
                                  <span className="font-mono font-bold text-stone-900 block">
                                    {a.referenceCode}
                                  </span>
                                  <span className="text-[10px] text-stone-400">
                                    {new Date(a.createdAt).toLocaleDateString()}
                                  </span>
                                </td>
                                <td className="p-3 tabular-nums">
                                  <div className="font-semibold text-stone-900">{a.date}</div>
                                  <div className="text-stone-500">
                                    {a.startTime} - {a.endTime}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="font-bold text-stone-900">{a.customerName}</div>
                                  <div className="text-[11px] text-stone-600 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-emerald-800" />
                                    <span>{a.customerPhone}</span>
                                  </div>
                                  {a.customerNotes && (
                                    <div className="text-[10px] text-stone-500 italic truncate max-w-xs">
                                      Note: "{a.customerNotes}"
                                    </div>
                                  )}
                                </td>
                                <td className="p-3">
                                  <div className="font-semibold text-stone-900">{a.serviceName}</div>
                                  <div className="text-stone-500 tabular-nums">
                                    ₹{a.servicePrice.toLocaleString('en-IN')} ({a.durationMinutes}m)
                                  </div>
                                </td>
                                <td className="p-3 text-stone-700">
                                  {a.staffName || 'Any Specialist'}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                      a.status === 'Confirmed'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : a.status === 'Pending'
                                        ? 'bg-amber-100 text-amber-800'
                                        : a.status === 'Cancelled'
                                        ? 'bg-stone-200 text-stone-600'
                                        : a.status === 'Completed'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {a.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {a.status === 'Pending' && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateStatus(a.id, 'Confirmed')}
                                          className="p-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded cursor-pointer"
                                          title="Confirm"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleUpdateStatus(a.id, 'Rejected', 'Declined due to facility capacity')}
                                          className="p-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded cursor-pointer"
                                          title="Reject"
                                        >
                                          <Ban className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}

                                    <button
                                      onClick={() => {
                                        setEditingAppointment(a);
                                        setInternalNoteText(a.internalNotes || '');
                                        setRescheduleDate(a.date);
                                        setRescheduleTime(a.startTime);
                                      }}
                                      className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded cursor-pointer"
                                    >
                                      Edit / Notes
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SERVICES & FEES */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-xl text-stone-900">
                        Farm Services & Workshops
                      </h4>
                      <p className="text-xs text-stone-500">
                        Manage offerings, durations, deliverables, and fees.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingService({
                          name: '',
                          category: 'Mushroom Cultivation',
                          durationMinutes: 45,
                          price: 500,
                          shortDescription: '',
                          fullDescription: '',
                          isActive: true,
                          deliverables: []
                        });
                        setServiceModalOpen(true);
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Service</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((s) => (
                      <div
                        key={s.id}
                        className="p-5 rounded-xl border border-stone-200 bg-stone-50 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                                {s.category}
                              </span>
                              <h5 className="font-bold text-stone-900 text-base">{s.name}</h5>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {s.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <p className="text-xs text-stone-600 line-clamp-2">
                            {s.shortDescription}
                          </p>

                          <div className="flex items-center gap-4 text-xs font-semibold text-stone-700">
                            <span>Duration: {s.durationMinutes} mins</span>
                            <span>Fee: {s.isFree ? 'Free' : `₹${s.price.toLocaleString('en-IN')}`}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setEditingService(s);
                              setServiceModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded cursor-pointer"
                          >
                            Edit Service
                          </button>

                          <button
                            onClick={() => handleDeleteService(s.id)}
                            className="p-1.5 text-stone-400 hover:text-red-700 cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: FARM SETTINGS */}
              {activeTab === 'settings' && settingsForm && (
                <form onSubmit={handleSaveBusinessSettings} className="space-y-6 max-w-4xl">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div>
                      <h4 className="font-display font-bold text-xl text-stone-900">
                        Business & Booking Settings
                      </h4>
                      <p className="text-xs text-stone-500">
                        Configure business name, address, contact numbers, hours, and booking rules.
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg cursor-pointer"
                    >
                      Save Settings
                    </button>
                  </div>

                  {/* General Info */}
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                    <h5 className="font-bold text-sm text-stone-900">Identity & Contact Details</h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Official Name</label>
                        <input
                          type="text"
                          value={settingsForm.name}
                          onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Legal Corporate Name</label>
                        <input
                          type="text"
                          value={settingsForm.legalName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, legalName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={settingsForm.phone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">WhatsApp Business Number</label>
                        <input
                          type="text"
                          value={settingsForm.whatsapp}
                          onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Official Email</label>
                        <input
                          type="email"
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Google Maps Profile URL</label>
                        <input
                          type="text"
                          value={settingsForm.googleMapsUrl}
                          onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Booking Rules */}
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                    <h5 className="font-bold text-sm text-stone-900">Appointment & Availability Rules</h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center gap-3 col-span-2 p-3 bg-white border border-stone-300 rounded-lg">
                        <input
                          type="checkbox"
                          id="autoConfirmCheck"
                          checked={settingsForm.bookingSettings.autoConfirm}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              bookingSettings: {
                                ...settingsForm.bookingSettings,
                                autoConfirm: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 text-emerald-800 rounded"
                        />
                        <label htmlFor="autoConfirmCheck" className="font-semibold text-stone-800">
                          Automatic Confirmation (If checked, bookings are confirmed immediately without requiring manual approval)
                        </label>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Minimum Notice Required (Hours)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="72"
                          value={settingsForm.bookingSettings.minNoticeHours}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              bookingSettings: {
                                ...settingsForm.bookingSettings,
                                minNoticeHours: Number(e.target.value)
                              }
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Maximum Days in Advance
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={settingsForm.bookingSettings.maxAdvanceDays}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              bookingSettings: {
                                ...settingsForm.bookingSettings,
                                maxAdvanceDays: Number(e.target.value)
                              }
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Buffer Minutes Between Appointments
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          step="5"
                          value={settingsForm.bookingSettings.bufferMinutes}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              bookingSettings: {
                                ...settingsForm.bookingSettings,
                                bufferMinutes: Number(e.target.value)
                              }
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Timezone
                        </label>
                        <input
                          type="text"
                          value={settingsForm.timezone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, timezone: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operating Hours per day */}
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                    <h5 className="font-bold text-sm text-stone-900">Operating Hours by Day of Week</h5>

                    <div className="space-y-2 text-xs">
                      {(
                        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as DayOfWeek[]
                      ).map((day) => {
                        const sched = settingsForm.operatingHours[day];
                        return (
                          <div
                            key={day}
                            className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded"
                          >
                            <div className="w-28 font-semibold text-stone-800">{day}</div>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={sched?.isOpen}
                                  onChange={(e) => {
                                    setSettingsForm({
                                      ...settingsForm,
                                      operatingHours: {
                                        ...settingsForm.operatingHours,
                                        [day]: { ...sched, isOpen: e.target.checked }
                                      }
                                    });
                                  }}
                                  className="w-4 h-4 rounded text-emerald-800"
                                />
                                <span>Open</span>
                              </label>

                              {sched?.isOpen && (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="time"
                                    value={sched.openTime}
                                    onChange={(e) => {
                                      setSettingsForm({
                                        ...settingsForm,
                                        operatingHours: {
                                          ...settingsForm.operatingHours,
                                          [day]: { ...sched, openTime: e.target.value }
                                        }
                                      });
                                    }}
                                    className="px-2 py-1 border border-stone-300 rounded text-xs"
                                  />
                                  <span>to</span>
                                  <input
                                    type="time"
                                    value={sched.closeTime}
                                    onChange={(e) => {
                                      setSettingsForm({
                                        ...settingsForm,
                                        operatingHours: {
                                          ...settingsForm.operatingHours,
                                          [day]: { ...sched, closeTime: e.target.value }
                                        }
                                      });
                                    }}
                                    className="px-2 py-1 border border-stone-300 rounded text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg cursor-pointer"
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 5: STAFF */}
              {activeTab === 'staff' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-xl text-stone-900">
                        Staff & Agronomists
                      </h4>
                      <p className="text-xs text-stone-500">
                        Manage technical instructors, spawn lab specialists, and guides.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingStaff({
                          name: '',
                          role: '',
                          bio: '',
                          specialties: [],
                          isActive: true,
                          assignedServiceIds: []
                        });
                        setStaffModalOpen(true);
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Staff Profile</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {staff.map((st) => (
                      <div
                        key={st.id}
                        className="p-5 rounded-xl border border-stone-200 bg-stone-50 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-bold text-stone-900 text-sm">{st.name}</h5>
                            <p className="text-xs font-semibold text-emerald-800">{st.role}</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              st.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {st.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 line-clamp-3">{st.bio}</p>

                        <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setEditingStaff(st);
                              setStaffModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(st.id)}
                            className="p-1.5 text-stone-400 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display font-bold text-xl text-stone-900">
                      Customer Directory
                    </h4>
                    <p className="text-xs text-stone-500">
                      Aggregated list of registered visitors and recurring spawn clients.
                    </p>
                  </div>

                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                        <tr>
                          <th className="p-3 font-semibold">Customer Name</th>
                          <th className="p-3 font-semibold">Mobile / WhatsApp</th>
                          <th className="p-3 font-semibold">Email</th>
                          <th className="p-3 font-semibold">Total Bookings</th>
                          <th className="p-3 font-semibold">Last Appointment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {customers.map((c, i) => (
                          <tr key={i} className="hover:bg-stone-50/50">
                            <td className="p-3 font-bold text-stone-900">{c.name}</td>
                            <td className="p-3 text-stone-700">{c.phone}</td>
                            <td className="p-3 text-stone-500">{c.email || '—'}</td>
                            <td className="p-3 tabular-nums font-semibold text-stone-900">
                              {c.totalBookings}
                            </td>
                            <td className="p-3 tabular-nums text-stone-600">{c.lastVisit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: NOTIFICATIONS LOG */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display font-bold text-xl text-stone-900">
                      Automated Notification Logs
                    </h4>
                    <p className="text-xs text-stone-500">
                      Audit trail of WhatsApp and email dispatch triggers sent to customers and farm managers.
                    </p>
                  </div>

                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                        <tr>
                          <th className="p-3 font-semibold">Timestamp</th>
                          <th className="p-3 font-semibold">Channel</th>
                          <th className="p-3 font-semibold">Event</th>
                          <th className="p-3 font-semibold">Recipient</th>
                          <th className="p-3 font-semibold">Message Preview</th>
                          <th className="p-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {notifications.map((n) => (
                          <tr key={n.id} className="hover:bg-stone-50/50">
                            <td className="p-3 text-stone-400 tabular-nums">
                              {new Date(n.timestamp).toLocaleString()}
                            </td>
                            <td className="p-3 font-semibold text-emerald-800">{n.channel}</td>
                            <td className="p-3 font-medium text-stone-900">{n.event}</td>
                            <td className="p-3 font-mono text-stone-600">{n.recipient}</td>
                            <td className="p-3 text-stone-600 max-w-sm truncate">{n.message}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                                {n.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* Appointment Edit / Reschedule Modal */}
      {editingAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setEditingAppointment(null)}
        >
          <div
            className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h5 className="font-bold text-stone-900 text-sm">
                Manage Booking {editingAppointment.referenceCode}
              </h5>
              <button
                onClick={() => setEditingAppointment(null)}
                className="p-1 text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1 text-stone-600">
              <p>Customer: <strong>{editingAppointment.customerName}</strong> ({editingAppointment.customerPhone})</p>
              <p>Service: <strong>{editingAppointment.serviceName}</strong></p>
              <p>Current: <strong>{editingAppointment.date} at {editingAppointment.startTime}</strong></p>
            </div>

            {/* Reschedule Section */}
            <div className="pt-2 border-t border-stone-200 space-y-2">
              <label className="block text-xs font-semibold text-stone-700">Reschedule Date & Time</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-stone-300 rounded"
                />
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-stone-300 rounded"
                />
              </div>
              <button
                type="button"
                onClick={() => handleReschedule(editingAppointment.id)}
                className="w-full py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded cursor-pointer"
              >
                Apply Reschedule
              </button>
            </div>

            {/* Internal Notes Section */}
            <div className="pt-2 border-t border-stone-200 space-y-2">
              <label className="block text-xs font-semibold text-stone-700">Internal Farm Notes</label>
              <textarea
                rows={2}
                placeholder="Private remarks for agronomists..."
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded"
              />
              <button
                type="button"
                onClick={() => handleSaveInternalNote(editingAppointment.id)}
                className="w-full py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded cursor-pointer"
              >
                Save Internal Notes
              </button>
            </div>

            {/* Status Change Buttons */}
            <div className="pt-2 border-t border-stone-200 flex flex-wrap gap-1.5">
              <button
                onClick={() => handleUpdateStatus(editingAppointment.id, 'Completed')}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 rounded cursor-pointer"
              >
                Mark Completed
              </button>
              <button
                onClick={() => handleUpdateStatus(editingAppointment.id, 'No-show')}
                className="px-2.5 py-1 text-xs font-semibold bg-stone-200 text-stone-700 hover:bg-stone-300 rounded cursor-pointer"
              >
                Mark No-show
              </button>
              <button
                onClick={() => handleUpdateStatus(editingAppointment.id, 'Cancelled')}
                className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 rounded cursor-pointer"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {serviceModalOpen && editingService && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setServiceModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-lg w-full p-6 space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h5 className="font-bold text-stone-900 text-sm">
                {editingService.id ? 'Edit Service' : 'Create New Service'}
              </h5>
              <button
                onClick={() => setServiceModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={editingService.durationMinutes || 45}
                    onChange={(e) =>
                      setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Fee (INR ₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingService.price || 0}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editingService.category || ''}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Short Summary</label>
                <input
                  type="text"
                  value={editingService.shortDescription || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, shortDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Description</label>
                <textarea
                  rows={2}
                  value={editingService.fullDescription || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, fullDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="srvActive"
                  checked={editingService.isActive !== false}
                  onChange={(e) =>
                    setEditingService({ ...editingService, isActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-emerald-800"
                />
                <label htmlFor="srvActive" className="font-semibold text-stone-700">
                  Service is currently active for booking
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {staffModalOpen && editingStaff && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setStaffModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-lg w-full p-6 space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h5 className="font-bold text-stone-900 text-sm">
                {editingStaff.id ? 'Edit Staff Profile' : 'Add Staff Member'}
              </h5>
              <button
                onClick={() => setStaffModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingStaff.name || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Title / Designation *</label>
                <input
                  type="text"
                  required
                  value={editingStaff.role || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Bio / Qualifications</label>
                <textarea
                  rows={3}
                  value={editingStaff.bio || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changePwOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setChangePwOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h5 className="font-bold text-stone-900 text-sm">Update Admin Password</h5>
              <button
                onClick={() => setChangePwOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pwError && (
              <div className="p-2.5 rounded bg-red-50 text-red-800 text-xs">
                {pwError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">New Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
