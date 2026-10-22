'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Link from 'next/link';
import AudienceDeactivateAccountModal from '@/components/audience/AudienceDeactivateAccountModal';
import { 
  Briefcase, 
  Mail,
  Edit2, 
  User, 
  ChevronLeft,
  ChevronDown,
  Camera,
  Settings,
  Shield,
  Headset,
  Bell,
  Type,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';

export default function UserProfileOverview() {
  const { user } = useAuthStore();
  const [activeSidebar, setActiveSidebar] = useState('profile');
  const [activeTab, setActiveTab] = useState('personal');
  const [activeSettingsTab, setActiveSettingsTab] = useState('notifications');
  const [supportTab, setSupportTab] = useState<'contact' | 'report'>('contact');
  const [editingMode, setEditingMode] = useState<'personal' | 'business' | null>(null);
  const [securityView, setSecurityView] = useState<'main' | 'change-password' | 'login-activity'>('main');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLogoutSuccessModal, setShowLogoutSuccessModal] = useState(false);
  const [showReportSuccessModal, setShowReportSuccessModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const [personalForm, setPersonalForm] = useState({ 
    first_name: '', 
    last_name: '', 
    phone: '', 
    email: '', 
    location: '', 
    bio: '' 
  });
  const [businessForm, setBusinessForm] = useState({ 
    business_name: '', 
    email: '', 
    phone: '', 
    location: '' 
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [reportForm, setReportForm] = useState({ message: '' });
  const [sessions, setSessions] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setPersonalForm({
        first_name: user.first_name || (user.name ? user.name.split(' ')[0] : '') || '',
        last_name: user.last_name || (user.name ? user.name.split(' ').slice(1).join(' ') : '') || '',
        phone: user.phone || '',
        email: user.email || '',
        location: user.location || '',
        bio: user.bio || ''
      });
      setBusinessForm({
        business_name: user.business_name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      });
    }
  }, [user, editingMode]);

  const handleSaveProfile = async (type: 'personal' | 'business') => {
    setIsSaving(true);
    try {
      const payload = type === 'personal' ? personalForm : businessForm;
      await api.put('/auth/profile', payload);
      await useAuthStore.getState().checkAuth();
      setShowSuccessModal(true);
      setEditingMode(null);
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    try {
      await api.put('/auth/password', {
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });
      setShowSuccessModal(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert('Failed to change password');
    }
  };

  const handleReportProblem = async () => {
    if (!reportForm.message.trim()) return;
    try {
      await api.post('/support/tickets', {
        subject: 'Report a problem',
        message: reportForm.message
      });
      setShowReportSuccessModal(true);
      setReportForm({ message: '' });
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const loadSessions = async () => {
    try {
      const res = await api.get('/auth/sessions');
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeSidebar === 'security' && securityView === 'login-activity') {
      loadSessions();
    }
  }, [activeSidebar, securityView]);

  const handleLogoutAllDevices = async () => {
    try {
      let allSessions = sessions;
      if (allSessions.length === 0) {
        const res = await api.get('/auth/sessions');
        allSessions = res.data.sessions || [];
      }
      
      const otherSessions = allSessions.filter(s => !s.is_current);
      for (const s of otherSessions) {
        await api.delete(`/auth/sessions/${s.id}`);
      }
      setShowLogoutModal(false);
      setShowLogoutSuccessModal(true);
      loadSessions();
    } catch (err) {
      console.error(err);
    }
  };


  // Notification toggles state
  const [notifState, setNotifState] = useState({
    email: true,
    booking: true,
    campaign: false,
    promo: false
  });

  // User profile details with real user data or clean empty state
  const firstName = user?.first_name || (user?.name ? user.name.split(' ')[0] : '') || '';
  const lastName = user?.last_name || (user?.name ? user.name.split(' ').slice(1).join(' ') : '') || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || user?.name || 'Studio Arella User';
  const email = user?.email || '—';
  const phone = user?.phone || '—';
  const userRole = user?.role === 'screen_owner' 
    ? 'Media Partner' 
    : user?.role === 'admin' 
    ? 'Administrator' 
    : user?.role 
    ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) 
    : 'Audience Member';
  const avatarUrl = user?.avatar;

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="w-full max-w-[1200px] mx-auto p-6 lg:p-10 pb-24">
          {!editingMode ? (
            <>
              <h1 className="text-[24px] font-semibold text-[#16151C] mb-8">Profile Details</h1>

          {/* Avatar & Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={fullName} 
                  className="w-[100px] h-[100px] rounded-[10px] object-cover border border-gray-100 shadow-sm"
                />
              ) : (
                <div className="w-[100px] h-[100px] rounded-[10px] bg-[#FAF5E6] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-[#D4AF37] text-3xl shadow-xs">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <h2 className="text-[24px] font-semibold text-[#16151C]">{fullName}</h2>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 text-[#16151C] text-[16px] font-light">
                    <Briefcase size={20} strokeWidth={1.5} />
                    <span>{userRole}</span>
                  </div>
                  {email !== '—' && (
                    <div className="flex items-center gap-2.5 text-[#16151C] text-[16px] font-light">
                      <Mail size={20} strokeWidth={1.5} />
                      <span>{email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/user-profile"
                className="flex items-center justify-center gap-2 border border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors text-black h-[50px] px-5 rounded-[6px] text-[15px] font-medium shadow-sm"
              >
                <ExternalLink size={18} strokeWidth={1.5} />
                View Fan Profile
              </Link>
              <button 
                onClick={() => setEditingMode(activeTab as 'personal' | 'business')}
                className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c29f31] transition-colors text-black h-[50px] px-6 rounded-[6px] text-[16px] font-light shadow-sm"
              >
                <Edit2 size={20} strokeWidth={1.5} />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[#A2A1A8]/20 mb-10"></div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Inner Sidebar */}
            <div className="w-full lg:w-[242px] shrink-0">
              <div className="border border-[#A2A1A8]/20 rounded-[10px] overflow-hidden bg-white">
                <button 
                  onClick={() => setActiveSidebar('profile')}
                  className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${
                    activeSidebar === 'profile' 
                      ? 'bg-[#D4AF37] text-black font-semibold' 
                      : 'bg-transparent text-[#16151C] font-light hover:bg-gray-50'
                  }`}
                >
                  <User size={20} strokeWidth={activeSidebar === 'profile' ? 2 : 1.5} />
                  <span className="text-[16px]">Profile</span>
                </button>
                
                <button 
                  onClick={() => setActiveSidebar('settings')}
                  className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${
                    activeSidebar === 'settings' 
                      ? 'bg-[#D4AF37] text-black font-semibold' 
                      : 'bg-transparent text-[#16151C] font-light hover:bg-gray-50'
                  }`}
                >
                  <Settings size={20} strokeWidth={activeSidebar === 'settings' ? 2 : 1.5} />
                  <span className="text-[16px]">Settings</span>
                </button>
                
                <button 
                  onClick={() => setActiveSidebar('security')}
                  className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${
                    activeSidebar === 'security' 
                      ? 'bg-[#D4AF37] text-black font-semibold' 
                      : 'bg-transparent text-[#16151C] font-light hover:bg-gray-50'
                  }`}
                >
                  <Shield size={20} strokeWidth={activeSidebar === 'security' ? 2 : 1.5} />
                  <span className="text-[16px]">Security</span>
                </button>

                <button 
                  onClick={() => setActiveSidebar('support')}
                  className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${
                    activeSidebar === 'support' 
                      ? 'bg-[#D4AF37] text-black font-semibold' 
                      : 'bg-transparent text-[#16151C] font-light hover:bg-gray-50'
                  }`}
                >
                  <Headset size={20} strokeWidth={activeSidebar === 'support' ? 2 : 1.5} />
                  <span className="text-[16px]">Support</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 max-w-[768px]">
              
              {activeSidebar === 'profile' && (
                <>
                  {/* Tabs */}
                  <div className="flex flex-wrap gap-8 border-b border-[#A2A1A8]/20 mb-8 relative">
                <button 
                  onClick={() => setActiveTab('personal')}
                  className={`flex items-center gap-2.5 pb-3 relative transition-colors ${
                    activeTab === 'personal' ? 'text-[#D4AF37] font-semibold text-[17px]' : 'text-[#16151C] font-light text-[17px] hover:text-gray-600'
                  }`}
                >
                  <User size={20} strokeWidth={activeTab === 'personal' ? 2 : 1.5} />
                  Personal Information
                  {activeTab === 'personal' && (
                    <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                  )}
                </button>
                
                <button 
                  onClick={() => setActiveTab('business')}
                  className={`flex items-center gap-2.5 pb-3 relative transition-colors ${
                    activeTab === 'business' ? 'text-[#D4AF37] font-semibold text-[17px]' : 'text-[#16151C] font-light text-[17px] hover:text-gray-600'
                  }`}
                >
                  <Briefcase size={20} strokeWidth={activeTab === 'business' ? 2 : 1.5} />
                  Business Information
                  {activeTab === 'business' && (
                    <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                  )}
                </button>
              </div>

              {/* Form Grid */}
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">First Name</label>
                    <div className="text-[16px] text-[#16151C] font-light">{firstName || '—'}</div>
                  </div>
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Last Name</label>
                    <div className="text-[16px] text-[#16151C] font-light">{lastName || '—'}</div>
                  </div>
                  
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Mobile Number</label>
                    <div className="text-[16px] text-[#16151C] font-light">{phone || '—'}</div>
                  </div>
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Email Address</label>
                    <div className="text-[16px] text-[#16151C] font-light">{email || '—'}</div>
                  </div>

                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Location</label>
                    <div className="text-[16px] text-[#16151C] font-light">{user?.location || '—'}</div>
                  </div>
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Bio</label>
                    <div className="text-[16px] text-[#16151C] font-light">{user?.bio || '—'}</div>
                  </div>

                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Account Role</label>
                    <div className="text-[16px] text-[#16151C] font-light">{userRole}</div>
                  </div>
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Member Since</label>
                    <div className="text-[16px] text-[#16151C] font-light">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Business Name</label>
                    <div className="text-[16px] text-[#16151C] font-light">{user?.business_name || '—'}</div>
                  </div>
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Business Email</label>
                    <div className="text-[16px] text-[#16151C] font-light">{user?.business_email || (user?.business_name ? user?.email : '') || '—'}</div>
                  </div>
                  
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Business Phone</label>
                    <div className="text-[16px] text-[#16151C] font-light">{user?.phone || '—'}</div>
                  </div>
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Business Location</label>
                    <div className="text-[16px] text-[#16151C] font-light">{user?.location || '—'}</div>
                  </div>
                </div>
              )}

              {/* Catch-all for other tabs if they get added */}
              {activeTab !== 'personal' && activeTab !== 'business' && (
                <div className="py-12 text-center text-gray-500 font-light">
                  This section is under construction.
                </div>
              )}
              </>
              )}

              {activeSidebar === 'settings' && (
                <>
                  <div className="flex flex-wrap gap-8 border-b border-[#A2A1A8]/20 mb-8 relative">
                    <button 
                      onClick={() => setActiveSettingsTab('notifications')}
                      className={`flex items-center gap-2.5 pb-3 relative transition-colors ${
                        activeSettingsTab === 'notifications' ? 'text-[#D4AF37] font-semibold text-[17px]' : 'text-[#16151C] font-light text-[17px] hover:text-gray-600'
                      }`}
                    >
                      <Bell size={20} strokeWidth={activeSettingsTab === 'notifications' ? 2 : 1.5} />
                      Notifications
                      {activeSettingsTab === 'notifications' && (
                        <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => setActiveSettingsTab('preferences')}
                      className={`flex items-center gap-2.5 pb-3 relative transition-colors ${
                        activeSettingsTab === 'preferences' ? 'text-[#D4AF37] font-semibold text-[17px]' : 'text-[#16151C] font-light text-[17px] hover:text-gray-600'
                      }`}
                    >
                      <SlidersHorizontal size={20} strokeWidth={activeSettingsTab === 'preferences' ? 2 : 1.5} />
                      Preferences
                      {activeSettingsTab === 'preferences' && (
                        <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                      )}
                    </button>
                  </div>

                  {activeSettingsTab === 'notifications' && (
                    <div className="flex flex-col gap-10">
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[16px] font-medium text-[#16151C] mb-1">Email Notifications</div>
                          <div className="text-[14px] text-[#16151C] font-light">Receive updates about your account and bookings.</div>
                        </div>
                        <button 
                          onClick={() => setNotifState(s => ({...s, email: !s.email}))}
                          className={`w-[54px] h-[23px] rounded-[10px] flex items-center px-[1px] transition-colors duration-300 ${notifState.email ? 'bg-[#D4AF37] justify-end' : 'bg-[#D4AF37]/40 justify-start'}`}
                        >
                          <div className={`w-[22px] h-[20px] rounded-[10px] bg-white mx-[5px]`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[16px] font-medium text-[#16151C] mb-1">Booking Updates</div>
                          <div className="text-[14px] text-[#16151C] font-light">Get notified when a booking is confirmed, changed or cancelled.</div>
                        </div>
                        <button 
                          onClick={() => setNotifState(s => ({...s, booking: !s.booking}))}
                          className={`w-[54px] h-[23px] rounded-[10px] flex items-center px-[1px] transition-colors duration-300 ${notifState.booking ? 'bg-[#D4AF37] justify-end' : 'bg-[#D4AF37]/40 justify-start'}`}
                        >
                          <div className={`w-[22px] h-[20px] rounded-[10px] bg-white mx-[5px]`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[16px] font-medium text-[#16151C] mb-1">Campaign Updates</div>
                          <div className="text-[14px] text-[#16151C] font-light">Receive updates about your campaigns.</div>
                        </div>
                        <button 
                          onClick={() => setNotifState(s => ({...s, campaign: !s.campaign}))}
                          className={`w-[54px] h-[23px] rounded-[10px] flex items-center px-[1px] transition-colors duration-300 ${notifState.campaign ? 'bg-[#D4AF37] justify-end' : 'bg-[#D4AF37]/40 justify-start'}`}
                        >
                          <div className={`w-[22px] h-[20px] rounded-[10px] bg-white mx-[5px]`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[16px] font-medium text-[#16151C] mb-1">Promotional Emails</div>
                          <div className="text-[14px] text-[#16151C] font-light">Receive offers, news and updates from Studio Arella.</div>
                        </div>
                        <button 
                          onClick={() => setNotifState(s => ({...s, promo: !s.promo}))}
                          className={`w-[54px] h-[23px] rounded-[10px] flex items-center px-[1px] transition-colors duration-300 ${notifState.promo ? 'bg-[#D4AF37] justify-end' : 'bg-[#D4AF37]/40 justify-start'}`}
                        >
                          <div className={`w-[22px] h-[20px] rounded-[10px] bg-white mx-[5px]`} />
                        </button>
                      </div>

                    </div>
                  )}

                  {activeSettingsTab === 'preferences' && (
                    <div className="flex flex-col gap-[33px]">
                      
                      {/* Language */}
                      <div className="flex flex-col gap-[13px] w-full max-w-[460px]">
                        <label className="text-[16px] font-medium text-[#16151C]">Language</label>
                        <div className="relative">
                          <select 
                            className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#A2A1A8]/80 appearance-none outline-none focus:border-[#D4AF37]"
                            defaultValue="English"
                          >
                            <option value="English">English</option>
                          </select>
                          <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16151C]" />
                        </div>
                      </div>

                      {/* Currency */}
                      <div className="flex flex-col gap-[13px] w-full max-w-[460px]">
                        <label className="text-[16px] font-medium text-[#16151C]">Currency</label>
                        <div className="relative">
                          <select 
                            className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#A2A1A8]/80 appearance-none outline-none focus:border-[#D4AF37]"
                            defaultValue="Naira (NGN)"
                          >
                            <option value="Naira (NGN)">Naira (NGN)</option>
                          </select>
                          <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16151C]" />
                        </div>
                      </div>

                      {/* Theme */}
                      <div className="flex flex-col gap-[13px] w-full max-w-[460px]">
                        <label className="text-[16px] font-medium text-[#16151C]">Theme</label>
                        <div className="relative">
                          <select 
                            className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#A2A1A8]/80 appearance-none outline-none focus:border-[#D4AF37]"
                            defaultValue="Light"
                          >
                            <option value="Light">Light</option>
                          </select>
                          <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16151C]" />
                        </div>
                      </div>

                    </div>
                  )}
                </>
              )}

              {activeSidebar === 'security' && securityView === 'main' && (
                <>
                  <div className="flex flex-wrap gap-8 border-b border-[#A2A1A8]/20 mb-8 relative">
                    <div className="flex items-center gap-2.5 pb-3 relative">
                      <Bell size={24} className="text-[#D4AF37]" strokeWidth={1.5} />
                      <span className="text-[#D4AF37] font-semibold text-[17px]">Security & privacy</span>
                      <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[33px]">
                    <div 
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => setSecurityView('change-password')}
                    >
                      <div>
                        <div className="text-[16px] font-medium text-[#16151C] mb-1">Change password</div>
                        <div className="text-[14px] text-[#16151C] font-light">Reset your password details</div>
                      </div>
                      <ArrowRight size={20} className="text-[#5F6D7E] group-hover:text-black transition-colors" />
                    </div>

                    <div 
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => setSecurityView('login-activity')}
                    >
                      <div>
                        <div className="text-[16px] font-medium text-[#16151C] mb-1">Login activity</div>
                        <div className="text-[14px] text-[#16151C] font-light">View recent devices and sessions.</div>
                      </div>
                      <ArrowRight size={20} className="text-[#5F6D7E] group-hover:text-black transition-colors" />
                    </div>

                    <div 
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => setShowLogoutModal(true)}
                    >
                      <div>
                        <div className="text-[16px] font-medium text-[#16151C] mb-1">Log out of all devices</div>
                        <div className="text-[14px] text-[#16151C] font-light">Disconnect your account from all devices you are logged into</div>
                      </div>
                      <ArrowRight size={20} className="text-[#5F6D7E] group-hover:text-black transition-colors" />
                    </div>

                    <div 
                      className="flex items-center justify-between cursor-pointer group pt-2 border-t border-[#A2A1A8]/10"
                      onClick={() => setShowDeactivateModal(true)}
                    >
                      <div>
                        <div className="text-[16px] font-medium text-[#F64A4A] mb-1">Deactivate account</div>
                        <div className="text-[14px] text-[#16151C] font-light">Temporarily or permanently close your Studio Arella account</div>
                      </div>
                      <ArrowRight size={20} className="text-[#5F6D7E] group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </>
              )}

              {activeSidebar === 'security' && securityView === 'change-password' && (
                <>
                  <div className="flex flex-wrap gap-8 border-b border-[#A2A1A8]/20 mb-10 relative">
                    <button 
                      onClick={() => setSecurityView('main')}
                      className="flex items-center gap-2.5 pb-3 relative hover:opacity-80 transition-opacity"
                    >
                      <ArrowLeft size={20} className="text-[#D4AF37]" strokeWidth={2} />
                      <span className="text-[#D4AF37] font-semibold text-[17px]">Change password</span>
                      <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                    </button>
                  </div>

                  <div className="flex flex-col gap-8">
                    {/* Current password */}
                    <div className="flex flex-col gap-3 w-full max-w-[460px]">
                      <label className="text-[16px] font-medium text-[#16151C]">Current password</label>
                      <input 
                        type="password"
                        placeholder="Enter current password"
                        className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* New password */}
                    <div className="flex flex-col gap-3 w-full max-w-[460px]">
                      <label className="text-[16px] font-medium text-[#16151C]">New password</label>
                      <input 
                        type="password"
                        placeholder="Enter new password"
                        className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Confirm password */}
                    <div className="flex flex-col gap-3 w-full max-w-[460px]">
                      <label className="text-[16px] font-medium text-[#16151C]">Confirm password</label>
                      <input 
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <button 
                      onClick={() => setShowSuccessModal(true)}
                      className="w-fit h-[40px] px-6 mt-4 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-medium text-[14px] rounded-[6px] transition-colors"
                    >
                      Reset Password
                    </button>
                  </div>
                </>
              )}

              {activeSidebar === 'security' && securityView === 'login-activity' && (
                <>
                  <div className="flex flex-wrap gap-8 border-b border-[#A2A1A8]/20 mb-10 relative">
                    <button 
                      onClick={() => setSecurityView('main')}
                      className="flex items-center gap-2.5 pb-3 relative hover:opacity-80 transition-opacity"
                    >
                      <ArrowLeft size={20} className="text-[#D4AF37]" strokeWidth={2} />
                      <span className="text-[#D4AF37] font-semibold text-[17px]">Login activity</span>
                      <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                    </button>
                  </div>

                  <div className="flex flex-col gap-8 w-full max-w-[660px]">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="text-[16px] font-medium text-[#16151C]">Windows</div>
                        <div className="text-[14px] font-light text-[#16151C]">Logged in 3days ago</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="text-[16px] font-medium text-[#16151C]">MacOs</div>
                        <div className="text-[14px] font-light text-[#16151C]">Logged in August 15, 2026</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="text-[16px] font-medium text-[#16151C]">MacOs</div>
                        <div className="text-[14px] font-light text-[#16151C]">Logged in August 15, 2026</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeSidebar === 'support' && (
                <>
                  {/* Tabs */}
                  <div className="flex flex-wrap gap-8 border-b border-[#A2A1A8]/20 mb-8 relative">
                    <button 
                      onClick={() => setSupportTab('contact')}
                      className={`flex items-center gap-2.5 pb-3 relative hover:opacity-80 transition-opacity ${
                        supportTab === 'contact' ? 'text-[#D4AF37]' : 'text-[#16151C]'
                      }`}
                    >
                      <Bell size={20} className={supportTab === 'contact' ? "text-[#D4AF37]" : "text-[#16151C]"} strokeWidth={2} />
                      <span className={`font-semibold text-[17px] ${supportTab === 'contact' ? 'text-[#D4AF37]' : 'text-[#16151C]'}`}>Contact support</span>
                      {supportTab === 'contact' && (
                        <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => setSupportTab('report')}
                      className={`flex items-center gap-2.5 pb-3 relative hover:opacity-80 transition-opacity ${
                        supportTab === 'report' ? 'text-[#D4AF37]' : 'text-[#16151C]'
                      }`}
                    >
                      <Type size={20} className={supportTab === 'report' ? "text-[#D4AF37]" : "text-[#16151C]"} strokeWidth={2} />
                      <span className={`font-semibold text-[17px] ${supportTab === 'report' ? 'text-[#D4AF37]' : 'text-[#16151C]'}`}>Report a problem</span>
                      {supportTab === 'report' && (
                        <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                      )}
                    </button>
                  </div>

                  {/* Tab Content */}
                  {supportTab === 'contact' && (
                    <div className="flex flex-wrap gap-y-8 gap-x-32 w-full max-w-[700px]">
                      <div className="flex flex-col gap-[5px] w-full max-w-[280px]">
                        <div className="text-[14px] font-light text-[#A2A1A8]">Phone number</div>
                        <div className="text-[16px] font-light text-[#16151C] pb-2 border-b border-[#A2A1A8]/10">02034567890</div>
                      </div>

                      <div className="flex flex-col gap-[5px] w-full max-w-[280px]">
                        <div className="text-[14px] font-light text-[#A2A1A8]">Email</div>
                        <div className="text-[16px] font-light text-[#16151C] pb-2 border-b border-[#A2A1A8]/10">hello@studioarella.com</div>
                      </div>
                    </div>
                  )}

                  {supportTab === 'report' && (
                    <div className="flex flex-col gap-[13px] w-full max-w-[575px]">
                      <div className="text-[16px] font-medium text-[#16151C] leading-[150%]">Message us</div>
                      <textarea 
                        placeholder="Enter message"
                        value={reportForm.message}
                        onChange={(e) => setReportForm({message: e.target.value})}
                        className="w-full h-[232px] p-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37] resize-none"
                      ></textarea>
                      <button 
                        onClick={handleReportProblem}
                        className="mt-2 w-fit h-[40px] px-6 bg-[#D4AF37] hover:bg-[#c29f31] text-[#16151C] font-normal text-[14px] capitalize rounded-[6px] transition-colors"
                      >
                        Send Message
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          </>
          ) : editingMode === 'business' ? (
            <div className="flex-1 max-w-[850px]">
              <div className="flex items-center gap-4 mb-10">
                <button 
                  onClick={() => setEditingMode(null)} 
                  className="flex items-center gap-2 text-[#16151C] font-semibold text-[16px] hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft size={20} strokeWidth={2} /> 
                  Back
                </button>
                <h2 className="text-[16px] font-semibold text-[#16151C]">Edit profile (Business information)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
                <input 
                  type="text" 
                  placeholder="Business name"
                  value={businessForm.business_name}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, business_name: e.target.value }))}
                  className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                />
                <input 
                  type="email" 
                  placeholder="Business email"
                  value={businessForm.email}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                />
                <input 
                  type="tel" 
                  placeholder="Business phone"
                  value={businessForm.phone}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                />
                <input 
                  type="text" 
                  placeholder="Business location"
                  value={businessForm.location}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center gap-5">
                <button 
                  onClick={() => setEditingMode(null)}
                  className="h-[40px] px-5 rounded-[10px] border border-[#A2A1A8]/20 text-[16px] font-light text-[#16151C] hover:bg-gray-50 transition-colors flex items-center justify-center min-w-[91px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSaveProfile('business')}
                  disabled={isSaving}
                  className="h-[40px] px-8 rounded-[6px] bg-[#D4AF37] text-[14px] text-black hover:bg-[#c29f31] transition-colors flex items-center justify-center min-w-[116px] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 max-w-[850px]">
              <div className="flex items-center gap-4 mb-10">
                <button 
                  onClick={() => setEditingMode(null)} 
                  className="flex items-center gap-2 text-[#16151C] font-semibold text-[16px] hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft size={20} strokeWidth={2} /> 
                  Back
                </button>
                <h2 className="text-[16px] font-semibold text-[#16151C]">Edit profile (Personal information)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
                <input 
                  type="text" 
                  placeholder="First name"
                  value={personalForm.first_name}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                />
                <input 
                  type="text" 
                  placeholder="Last name"
                  value={personalForm.last_name}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                />
                <input 
                  type="tel" 
                  placeholder="Mobile number"
                  value={personalForm.phone}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                />
                <input 
                  type="email" 
                  placeholder="Email address"
                  value={personalForm.email}
                  disabled
                  title="Email cannot be changed directly"
                  className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-[#A2A1A8]/5 text-[17px] font-light text-[#16151C]/70 placeholder:text-[#A2A1A8]/80 outline-none cursor-not-allowed"
                />
                <input 
                  type="text" 
                  placeholder="Location / Address"
                  value={personalForm.location}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                />
                <input 
                  type="text" 
                  placeholder="Bio"
                  value={personalForm.bio}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full h-[56px] px-4 rounded-[10px] border border-[#A2A1A8]/20 bg-transparent text-[17px] font-light text-[#16151C] placeholder:text-[#A2A1A8]/80 outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center gap-5">
                <button 
                  onClick={() => setEditingMode(null)}
                  className="h-[40px] px-5 rounded-[10px] border border-[#A2A1A8]/20 text-[16px] font-light text-[#16151C] hover:bg-gray-50 transition-colors flex items-center justify-center min-w-[91px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSaveProfile('personal')}
                  disabled={isSaving}
                  className="h-[40px] px-8 rounded-[6px] bg-[#D4AF37] text-[14px] text-black hover:bg-[#c29f31] transition-colors flex items-center justify-center min-w-[116px] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </PageTransition>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="relative w-full max-w-[625px] h-[565px] bg-white rounded-[32px] flex flex-col items-center justify-center">
            {/* Close button */}
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-8 right-8 text-[#101828] hover:opacity-70 transition-opacity"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            {/* Glowing checkmark */}
            <div className="relative w-[70px] h-[70px] flex items-center justify-center mb-8">
              <div className="absolute inset-[-50%] rounded-full bg-[radial-gradient(circle,#D4AF37_0%,transparent_70%)] opacity-20 blur-md"></div>
              <div className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,#D4AF37_0%,transparent_70%)] opacity-30 blur-md"></div>
              <div className="relative w-full h-full rounded-full flex items-center justify-center bg-[radial-gradient(116.28%_116.28%_at_0%_-16.28%,#443A18_4.69%,#D4AF37_98.31%)]">
                <Check size={28} strokeWidth={3} className="text-white" />
              </div>
            </div>

            {/* Success message */}
            <h3 className="text-[20px] font-semibold text-[#16151C] mb-8">
              Password changed successfully
            </h3>

            {/* Go back button */}
            <button 
              onClick={() => {
                setShowSuccessModal(false);
                setSecurityView('main');
              }}
              className="w-full max-w-[468px] h-[56px] bg-[#D4AF37] hover:bg-[#c29f31] text-black font-medium text-[16px] rounded-[6px] transition-colors flex items-center justify-center"
            >
              Go back
            </button>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="relative w-full max-w-[625px] bg-white rounded-[32px] flex flex-col items-center justify-center p-14 text-center">
            <h3 className="text-[28px] leading-[40px] font-semibold text-[#16151C] mb-12 max-w-[500px]">
              Are you sure you want to logged out on all devices you are logged into?
            </h3>

            <div className="flex w-full gap-5 max-w-[500px]">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 h-[60px] bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#16151C] font-medium text-[18px] rounded-[12px] transition-colors"
              >
                No
              </button>
              <button 
                onClick={() => {
                  setShowLogoutModal(false);
                  setShowLogoutSuccessModal(true);
                }}
                className="flex-1 h-[60px] bg-[#D4AF37] hover:bg-[#c29f31] text-[#16151C] font-medium text-[18px] rounded-[12px] transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="relative w-full max-w-[625px] h-[565px] bg-white rounded-[32px] flex flex-col items-center justify-center">
            {/* Close button */}
            <button 
              onClick={() => setShowLogoutSuccessModal(false)}
              className="absolute top-8 right-8 text-[#101828] hover:opacity-70 transition-opacity"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            {/* Glowing checkmark */}
            <div className="relative w-[70px] h-[70px] flex items-center justify-center mb-8">
              <div className="absolute inset-[-50%] rounded-full bg-[radial-gradient(circle,#D4AF37_0%,transparent_70%)] opacity-20 blur-md"></div>
              <div className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,#D4AF37_0%,transparent_70%)] opacity-30 blur-md"></div>
              <div className="relative w-full h-full rounded-full flex items-center justify-center bg-[radial-gradient(116.28%_116.28%_at_0%_-16.28%,#443A18_4.69%,#D4AF37_98.31%)]">
                <Check size={28} strokeWidth={3} className="text-white" />
              </div>
            </div>

            {/* Success message */}
            <h3 className="text-[20px] font-semibold text-[#16151C] mb-8">
              You logged out on all devices
            </h3>

            {/* Go back button */}
            <button 
              onClick={() => setShowLogoutSuccessModal(false)}
              className="w-full max-w-[468px] h-[56px] bg-[#D4AF37] hover:bg-[#c29f31] text-black font-medium text-[16px] rounded-[6px] transition-colors flex items-center justify-center"
            >
              Go back
            </button>
          </div>
        </div>
      )}

      {showReportSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="relative w-full max-w-[625px] h-[565px] bg-white rounded-[32px] flex flex-col items-center justify-center">
            {/* Close button */}
            <button 
              onClick={() => setShowReportSuccessModal(false)}
              className="absolute top-8 right-8 text-[#101828] hover:opacity-70 transition-opacity"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            {/* Glowing checkmark */}
            <div className="relative w-[70px] h-[70px] flex items-center justify-center mb-8">
              <div className="absolute inset-[-50%] rounded-full bg-[radial-gradient(circle,#D4AF37_0%,transparent_70%)] opacity-20 blur-md"></div>
              <div className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,#D4AF37_0%,transparent_70%)] opacity-30 blur-md"></div>
              <div className="relative w-full h-full rounded-full flex items-center justify-center bg-[radial-gradient(116.28%_116.28%_at_0%_-16.28%,#443A18_4.69%,#D4AF37_98.31%)]">
                <Check size={28} strokeWidth={3} className="text-white" />
              </div>
            </div>

            {/* Success message */}
            <h3 className="text-[20px] font-semibold text-[#16151C] mb-8">
              Message sent
            </h3>

            {/* Go back button */}
            <button 
              onClick={() => setShowReportSuccessModal(false)}
              className="w-full max-w-[468px] h-[56px] bg-[#D4AF37] hover:bg-[#c29f31] text-black font-medium text-[16px] rounded-[6px] transition-colors flex items-center justify-center"
            >
              Go back
            </button>
          </div>
        </div>
      )}

      {/* Deactivate Account Confirmation Filter Popup */}
      <AudienceDeactivateAccountModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
      />
    </DashboardLayout>
  );
}
