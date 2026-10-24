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
import { theme } from '@/lib/theme';

const F = theme.font.body;

export default function UserProfileOverview() {
  const { user } = useAuthStore();
  const [activeSidebar, setActiveSidebar] = useState('profile');
  const [activeTab, setActiveTab] = useState('personal');
  const [activeSettingsTab, setActiveSettingsTab] = useState('notifications');
  const [supportTab, setSupportTab] = useState<'contact' | 'report'>('contact');
  const [editingMode, setEditingMode] = useState<'personal' | 'business' | null>(null);
  const [securityView, setSecurityView] = useState<'main' | 'change-password' | 'login-activity'>('main');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('Profile updated successfully');
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

  // Helper to extract 10-digit number without +234 or leading zero
  const getPhoneDigits = (fullPhone: string) => {
    if (!fullPhone) return '';
    let digits = fullPhone.replace(/^\+234\s*/, '').trim();
    if (digits.startsWith('0') && digits.length > 1) {
      digits = digits.slice(1);
    }
    return digits;
  };

  const handlePhoneChange = (val: string, formType: 'personal' | 'business') => {
    // Strip +234 if pasted
    let digits = val.replace(/^\+234\s*/, '');
    // Keep only numeric digits
    digits = digits.replace(/\D/g, '');
    // If user typed leading 0, strip it
    if (digits.startsWith('0') && digits.length > 1) {
      digits = digits.slice(1);
    }
    // Limit to 10 digits
    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }
    const formatted = digits ? `+234 ${digits}` : '';
    if (formType === 'personal') {
      setPersonalForm(prev => ({ ...prev, phone: formatted }));
    } else {
      setBusinessForm(prev => ({ ...prev, phone: formatted }));
    }
  };

  const handleSaveProfile = async (type: 'personal' | 'business') => {
    setIsSaving(true);
    try {
      const payload = type === 'personal' ? personalForm : businessForm;
      await api.put('/auth/profile', payload);
      await useAuthStore.getState().checkAuth();
      setSuccessModalMessage('Profile updated successfully');
      setShowSuccessModal(true);
      setEditingMode(null);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      alert(msg);
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
      setSuccessModalMessage('Password changed successfully');
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
        <div className="w-full max-w-[1200px] mx-auto p-6 lg:p-10 pb-24" style={{ fontFamily: F }}>
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
            {/* Content Area */}
            <div className="flex-1 min-w-0">
              
              {activeSidebar === 'profile' && (
                <>
                  {/* Tabs */}
                  <div className="flex flex-wrap gap-8 border-b border-[#A2A1A8]/20 mb-8 relative">
                <button 
                  onClick={() => setActiveTab('personal')}
                  className={`flex items-center gap-2.5 pb-3 relative transition-colors ${
                    activeTab === 'personal' ? 'text-[#D4AF37] font-semibold text-[17px]' : 'text-[#16151C] font-medium text-[17px] hover:text-gray-600'
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
                    activeTab === 'business' ? 'text-[#D4AF37] font-semibold text-[17px]' : 'text-[#16151C] font-medium text-[17px] hover:text-gray-600'
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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
                    <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
                      <label className="text-[13px] text-neutral-500 font-medium block mb-1">First Name</label>
                      <div className="text-[16px] text-[#16151C] dark:text-white font-medium">{firstName || '—'}</div>
                    </div>
                    <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
                      <label className="text-[13px] text-neutral-500 font-medium block mb-1">Last Name</label>
                      <div className="text-[16px] text-[#16151C] dark:text-white font-medium">{lastName || '—'}</div>
                    </div>
                    
                    <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
                      <label className="text-[13px] text-neutral-500 font-medium block mb-1">Mobile Number</label>
                      <div className="text-[16px] text-[#16151C] dark:text-white font-medium">{phone || '—'}</div>
                    </div>
                    <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
                      <label className="text-[13px] text-neutral-500 font-medium block mb-1">Email Address</label>
                      <div className="text-[16px] text-[#16151C] dark:text-white font-medium">{email || '—'}</div>
                    </div>

                    <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
                      <label className="text-[13px] text-neutral-500 font-medium block mb-1">Location / Address</label>
                      <div className="text-[16px] text-[#16151C] dark:text-white font-medium">{user?.location || '—'}</div>
                    </div>
                    <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
                      <label className="text-[13px] text-neutral-500 font-medium block mb-1">Account Role</label>
                      <div className="text-[16px] text-[#16151C] dark:text-white font-medium">{userRole}</div>
                    </div>

                    <div className="border-b border-neutral-200 dark:border-white/10 pb-3 md:col-span-2">
                      <label className="text-[13px] text-neutral-500 font-medium block mb-1">Member Since</label>
                      <div className="text-[16px] text-[#16151C] dark:text-white font-medium">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Full-Width Creator Bio Section */}
                  <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <label className="text-[15px] text-[#16151C] dark:text-white font-semibold block">Creator Bio / About Me</label>
                        <span className="text-[11px] font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Public</span>
                      </div>
                    </div>
                    {user?.bio ? (
                      <p className="text-[15px] text-[#16151C] dark:text-neutral-100 font-normal leading-[160%] bg-[#FAF5E6]/60 dark:bg-[#D4AF37]/10 p-5 rounded-[12px] border border-[#D4AF37]/30 whitespace-pre-wrap">
                        {user.bio}
                      </p>
                    ) : (
                      <div className="p-4 rounded-[10px] border border-dashed border-neutral-300 dark:border-white/20 bg-neutral-50 dark:bg-white/5 text-[14px] text-neutral-500 flex items-center justify-between">
                        <span>No creator bio added yet. Tell your listeners and sponsors about yourself.</span>
                        <button
                          onClick={() => setEditingMode('personal')}
                          className="text-[13px] font-semibold text-[#D4AF37] hover:underline cursor-pointer"
                        >
                          + Add Bio
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'business' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
                  <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
                    <label className="text-[13px] text-neutral-500 font-medium block mb-1">Business Name</label>
                    <div className="text-[16px] text-[#16151C] dark:text-white font-medium">{user?.business_name || '—'}</div>
                  </div>
                  <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
                    <label className="text-[13px] text-neutral-500 font-medium block mb-1">Business Email</label>
                    <div className="text-[16px] text-[#16151C] dark:text-white font-medium">{user?.business_email || (user?.business_name ? user?.email : '') || '—'}</div>
                  </div>
                  
                  <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
                    <label className="text-[13px] text-neutral-500 font-medium block mb-1">Business Phone</label>
                    <div className="text-[16px] text-[#16151C] dark:text-white font-medium">{user?.phone || '—'}</div>
                  </div>
                  <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
                    <label className="text-[13px] text-neutral-500 font-medium block mb-1">Business Location</label>
                    <div className="text-[16px] text-[#16151C] dark:text-white font-medium">{user?.location || '—'}</div>
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
                      <div className="flex flex-col gap-[10px] w-full max-w-[460px]">
                        <label className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-200">Language</label>
                        <div className="relative">
                          <select 
                            className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white appearance-none outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                            defaultValue="English"
                          >
                            <option value="English">English</option>
                          </select>
                          <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
                        </div>
                      </div>

                      {/* Currency */}
                      <div className="flex flex-col gap-[10px] w-full max-w-[460px]">
                        <label className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-200">Currency</label>
                        <div className="relative">
                          <select 
                            className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white appearance-none outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                            defaultValue="Naira (NGN)"
                          >
                            <option value="Naira (NGN)">Naira (NGN)</option>
                          </select>
                          <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
                        </div>
                      </div>

                      {/* Theme */}
                      <div className="flex flex-col gap-[10px] w-full max-w-[460px]">
                        <label className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-200">Theme</label>
                        <div className="relative">
                          <select 
                            className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white appearance-none outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                            defaultValue="Light"
                          >
                            <option value="Light">Light</option>
                          </select>
                          <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
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

                  <div className="flex flex-col gap-6">
                    {/* Current password */}
                    <div className="flex flex-col gap-2 w-full max-w-[460px]">
                      <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">Current password</label>
                      <input 
                        type="password"
                        placeholder="Enter current password"
                        className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                      />
                    </div>

                    {/* New password */}
                    <div className="flex flex-col gap-2 w-full max-w-[460px]">
                      <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">New password</label>
                      <input 
                        type="password"
                        placeholder="Enter new password"
                        className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                      />
                    </div>

                    {/* Confirm password */}
                    <div className="flex flex-col gap-2 w-full max-w-[460px]">
                      <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">Confirm password</label>
                      <input 
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                      />
                    </div>

                    <button 
                      onClick={() => setShowSuccessModal(true)}
                      className="w-fit h-[44px] px-8 mt-2 bg-[#D4AF37] hover:bg-[#c29f31] text-black font-semibold text-[14px] rounded-[8px] transition-colors shadow-sm cursor-pointer"
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
                      <div className="flex flex-col gap-1.5 w-full max-w-[280px]">
                        <div className="text-[13px] font-medium text-neutral-500">Phone number</div>
                        <div className="text-[16px] font-medium text-neutral-900 dark:text-white pb-2 border-b border-neutral-200 dark:border-white/10">02034567890</div>
                      </div>

                      <div className="flex flex-col gap-1.5 w-full max-w-[280px]">
                        <div className="text-[13px] font-medium text-neutral-500">Email</div>
                        <div className="text-[16px] font-medium text-neutral-900 dark:text-white pb-2 border-b border-neutral-200 dark:border-white/10">hello@studioarella.com</div>
                      </div>
                    </div>
                  )}

                  {supportTab === 'report' && (
                    <div className="flex flex-col gap-3 w-full max-w-[575px]">
                      <label className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-200">Message us</label>
                      <textarea 
                        placeholder="Describe your issue or feedback in detail..."
                        value={reportForm.message}
                        onChange={(e) => setReportForm({message: e.target.value})}
                        className="w-full h-[180px] p-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 resize-none transition-all shadow-xs leading-[160%]"
                      ></textarea>
                      <button 
                        onClick={handleReportProblem}
                        className="mt-2 w-fit h-[44px] px-8 bg-[#D4AF37] hover:bg-[#c29f31] text-black font-semibold text-[14px] rounded-[8px] transition-colors shadow-sm cursor-pointer"
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
            <div className="w-full max-w-[1050px] mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setEditingMode(null)} 
                    className="flex items-center gap-2 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white font-medium text-[15px] px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={18} strokeWidth={2} /> 
                    Back to Profile
                  </button>
                  <div className="w-[1px] h-5 bg-neutral-300 dark:bg-white/20"></div>
                  <div>
                    <h2 className="text-[20px] font-bold text-neutral-900 dark:text-white">
                      Edit Profile (Business Information)
                    </h2>
                    <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Update your business identity and company contact details
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <div className="bg-white dark:bg-[#1E1E22] rounded-2xl border border-neutral-200 dark:border-white/10 p-6 md:p-8 shadow-xs mb-8">
                <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                  <Briefcase size={18} className="text-[#D4AF37]" />
                  Business Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">
                      Business Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Arella Media Studio"
                      value={businessForm.business_name}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, business_name: e.target.value }))}
                      className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">
                      Business Email
                    </label>
                    <input 
                      type="email" 
                      placeholder="e.g. contact@business.com"
                      value={businessForm.email}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">
                      Business Phone
                    </label>
                    <div className="flex items-center h-[50px] w-full rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] shadow-xs focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition-all overflow-hidden">
                      {/* Country Code Prefix */}
                      <div className="flex items-center gap-1.5 px-3.5 h-full bg-neutral-100 dark:bg-white/5 border-r border-neutral-300 dark:border-white/10 shrink-0 select-none">
                        <span className="text-[16px]" role="img" aria-label="Nigeria">🇳🇬</span>
                        <span className="font-semibold text-neutral-900 dark:text-white text-[14px] tracking-tight">+234</span>
                      </div>
                      {/* 10-digit number input */}
                      <input 
                        type="tel" 
                        inputMode="numeric"
                        placeholder="801 234 5678"
                        value={getPhoneDigits(businessForm.phone)}
                        onChange={(e) => handlePhoneChange(e.target.value, 'business')}
                        className="flex-1 h-full px-4 bg-transparent text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-neutral-400">10 digits without leading 0</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">
                      Business Location / Address
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 12 Bank Road, Umuahia"
                      value={businessForm.location}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2 mb-16">
                <button 
                  onClick={() => setEditingMode(null)}
                  className="h-[44px] px-6 rounded-[8px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-transparent text-[15px] font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors flex items-center justify-center min-w-[100px] cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSaveProfile('business')}
                  disabled={isSaving}
                  className="h-[44px] px-8 rounded-[8px] bg-[#D4AF37] hover:bg-[#c29f31] text-[15px] font-semibold text-black transition-colors flex items-center justify-center min-w-[130px] cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[1050px] mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setEditingMode(null)} 
                    className="flex items-center gap-2 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white font-medium text-[15px] px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={18} strokeWidth={2} /> 
                    Back to Profile
                  </button>
                  <div className="w-[1px] h-5 bg-neutral-300 dark:bg-white/20"></div>
                  <div>
                    <h2 className="text-[20px] font-bold text-neutral-900 dark:text-white">
                      Edit Profile (Personal Information)
                    </h2>
                    <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Update your personal details, contact info, and creator bio
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <div className="bg-white dark:bg-[#1E1E22] rounded-2xl border border-neutral-200 dark:border-white/10 p-6 md:p-8 shadow-xs mb-8">
                <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                  <User size={18} className="text-[#D4AF37]" />
                  Personal & Contact Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* First Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">
                      First Name <span className="text-[#C9483A]">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter first name"
                      value={personalForm.first_name}
                      onChange={(e) => setPersonalForm(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">
                      Last Name <span className="text-[#C9483A]">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter last name"
                      value={personalForm.last_name}
                      onChange={(e) => setPersonalForm(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">
                      Mobile Number
                    </label>
                    <div className="flex items-center h-[50px] w-full rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] shadow-xs focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition-all overflow-hidden">
                      {/* Country Code Prefix */}
                      <div className="flex items-center gap-1.5 px-3.5 h-full bg-neutral-100 dark:bg-white/5 border-r border-neutral-300 dark:border-white/10 shrink-0 select-none">
                        <span className="text-[16px]" role="img" aria-label="Nigeria">🇳🇬</span>
                        <span className="font-semibold text-neutral-900 dark:text-white text-[14px] tracking-tight">+234</span>
                      </div>
                      {/* 10-digit number input */}
                      <input 
                        type="tel" 
                        inputMode="numeric"
                        placeholder="801 234 5678"
                        value={getPhoneDigits(personalForm.phone)}
                        onChange={(e) => handlePhoneChange(e.target.value, 'personal')}
                        className="flex-1 h-full px-4 bg-transparent text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-neutral-400">10 digits without leading 0</span>
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">
                        Email Address
                      </label>
                      <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded">
                        Read-only
                      </span>
                    </div>
                    <input 
                      type="email" 
                      placeholder="Email address"
                      value={personalForm.email}
                      disabled
                      title="Email cannot be changed directly"
                      className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-200 dark:border-white/10 bg-neutral-100/80 dark:bg-[#1A1A1D] text-[15px] font-medium text-neutral-500 dark:text-neutral-400 outline-none cursor-not-allowed shadow-none"
                    />
                  </div>

                  {/* Location / Address */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">
                      Location / City / Address
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Umuahia, Abia State, Nigeria"
                      value={personalForm.location}
                      onChange={(e) => setPersonalForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full h-[50px] px-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Creator Bio Card */}
              <div className="bg-white dark:bg-[#1E1E22] rounded-2xl border border-neutral-200 dark:border-white/10 p-6 md:p-8 shadow-xs mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-white">Creator Bio / About Me</h3>
                    <span className="text-[11px] font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Public</span>
                  </div>
                  <span className={`text-[13px] font-medium ${personalForm.bio.length > 280 ? 'text-[#C9483A] font-bold' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {personalForm.bio.length} / 300
                  </span>
                </div>
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
                  Tell listeners, fans, and prospective advertisers about yourself, your podcasts, or your media show.
                </p>
                <textarea 
                  rows={4}
                  maxLength={300}
                  placeholder="Write a short, engaging bio introducing who you are, what content you produce, and your creative vision..."
                  value={personalForm.bio}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full p-4 rounded-[10px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-[#2A2A2E] text-[15px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-xs resize-none leading-[160%]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2 mb-16">
                <button 
                  onClick={() => setEditingMode(null)}
                  className="h-[44px] px-6 rounded-[8px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-transparent text-[15px] font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors flex items-center justify-center min-w-[100px] cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSaveProfile('personal')}
                  disabled={isSaving}
                  className="h-[44px] px-8 rounded-[8px] bg-[#D4AF37] hover:bg-[#c29f31] text-[15px] font-semibold text-black transition-colors flex items-center justify-center min-w-[130px] cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
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
              {successModalMessage}
            </h3>

            {/* Go back button */}
            <button 
              onClick={() => {
                setShowSuccessModal(false);
                if (successModalMessage.includes('Password')) {
                  setSecurityView('main');
                }
              }}
              className="w-full max-w-[468px] h-[52px] bg-[#D4AF37] hover:bg-[#c29f31] text-black font-semibold text-[16px] rounded-[8px] transition-colors flex items-center justify-center cursor-pointer shadow-sm"
            >
              Continue
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
