'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition, FadeCard } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS } from '@/lib/currency';
import { SUPPORTED_TIMEZONES, TIMEZONE_LABELS } from '@/lib/timezone';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  CreditCard,
  Camera,
  Lock,
  Key, 
  Check, 
  Smartphone, 
  Globe, 
  Building2, 
  AlertTriangle, 
  Save, 
  Trash2, 
  ExternalLink,
  Laptop,
  CheckCircle2,
  X
} from 'lucide-react';
import { theme } from '@/lib/theme';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const F = theme.font.body;

const TABS = [
  { id: 'profile', label: 'User Profile', icon: User },
  { id: 'security', label: 'Security & Access', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing & Invoicing', icon: CreditCard },
  { id: 'preferences', label: 'Preferences', icon: Palette },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile Form
  const [form, setForm] = useState({
    name: '',
    handle: '',
    phone: '',
    location: '',
    bio: '',
    language: 'en'
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [billing, setBilling] = useState<{ credits: number; reserved_account_number: string | null; reserved_account_bank: string | null } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Security Form
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Two-Factor Auth
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [setting2FA, setSetting2FA] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState('');
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [show2FAPasswordPrompt, setShow2FAPasswordPrompt] = useState(false);
  const [start2FAPassword, setStart2FAPassword] = useState('');

  const handleStart2FASetup = async () => {
    if (!start2FAPassword) { toast('Enter your password to confirm', 'error'); return; }
    setSetting2FA(true);
    try {
      const res = await api.post('/auth/2fa/setup', { password: start2FAPassword });
      setQrCode(res.data.qr_code);
      setManualKey(res.data.manual_key);
      setShow2FAPasswordPrompt(false);
      setStart2FAPassword('');
      setShow2FASetup(true);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not start 2FA setup.', 'error');
    } finally {
      setSetting2FA(false);
    }
  };

  const handleConfirm2FASetup = async () => {
    if (twoFactorCode.length !== 6) { toast('Enter the 6-digit code from your authenticator app', 'error'); return; }
    setSetting2FA(true);
    try {
      await api.post('/auth/2fa/verify-setup', { code: twoFactorCode });
      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setTwoFactorCode('');
      toast('Two-factor authentication enabled!', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Incorrect code. Please try again.', 'error');
    } finally {
      setSetting2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disable2FAPassword) { toast('Enter your password to confirm', 'error'); return; }
    setDisabling2FA(true);
    try {
      await api.post('/auth/2fa/disable', { password: disable2FAPassword });
      setTwoFactorEnabled(false);
      setShow2FADisable(false);
      setDisable2FAPassword('');
      toast('Two-factor authentication disabled.', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Incorrect password.', 'error');
    } finally {
      setDisabling2FA(false);
    }
  };

  // Active Sessions
  const [sessions, setSessions] = useState<{ id: string; device: string; ip_address: string; last_active_at: string; is_current: boolean }[]>([]);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const SESSIONS_PREVIEW_COUNT = 5;
  const [loadingSessions, setLoadingSessions] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/auth/sessions');
      setSessions(res.data?.sessions || []);
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await api.delete(`/auth/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast('Session revoked', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not revoke session.', 'error');
    }
  };

  // Saved Cards
  const [savedCards, setSavedCards] = useState<{ id: string; card_type: string | null; last4: string | null; bank: string | null }[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);

  const fetchSavedCards = async () => {
    try {
      const res = await api.get('/payments/cards');
      setSavedCards(res.data?.cards || []);
    } catch {
      setSavedCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await api.delete(`/payments/cards/${id}`);
      setSavedCards((prev) => prev.filter((c) => c.id !== id));
      toast('Card removed', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not remove card.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) { toast('Please enter your password to confirm', 'error'); return; }
    setDeletingAccount(true);
    try {
      await api.delete('/auth/account', { data: { password: deletePassword } });
      toast('Your account has been deleted.', 'success');
      setShowDeleteModal(false);
      logout();
      router.push('/auth/login');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not delete account. Please try again.', 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  // Notification Toggles
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailBroadcasts: true,
    emailWallet: true,
    emailWeekly: false,
    smsAlerts: true,
    smsSecurity: true,
  });
  const [savingNotification, setSavingNotification] = useState<string | null>(null);

  // Preferences — real, persisted server-side (display-only: every actual
  // charge/booking/timestamp stays NGN/UTC underneath).
  const { currency, timezone, soundEnabled, setCurrency, setTimezone, setSoundEnabled } = usePreferencesStore();
  const [savingPreference, setSavingPreference] = useState<string | null>(null);

  const saveDisplayPreference = async (patch: { currency?: string; timezone?: string; sound_enabled?: boolean }, key: string) => {
    setSavingPreference(key);
    try {
      const res = await api.put('/auth/display-preferences', patch);
      // Keep the cached user object (and its localStorage copy) in sync —
      // otherwise a reload re-hydrates the preferences store from the
      // stale pre-save user object and silently reverts the UI even
      // though the backend saved correctly.
      updateUser({
        display_currency: res.data?.display_currency,
        display_timezone: res.data?.display_timezone,
        sound_enabled: res.data?.sound_enabled,
      });
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not save this preference.', 'error');
    } finally {
      setSavingPreference(null);
    }
  };

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        handle: user.handle || (user.email ? `@${user.email.split('@')[0]}` : ''),
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        language: user.language || 'en'
      });
      setTwoFactorEnabled(Boolean(user.two_factor_enabled));
      if (user.notification_preferences) {
        setNotifications((prev) => ({ ...prev, ...user.notification_preferences }));
      }
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
    fetchSavedCards();
  }, []);

  useEffect(() => {
    api.get('/finances/balance')
      .then((res) => setBilling({
        credits: Number(res.data?.credits ?? 0),
        reserved_account_number: res.data?.reserved_account_number || null,
        reserved_account_bank: res.data?.reserved_account_bank || null,
      }))
      .catch(() => setBilling({ credits: 0, reserved_account_number: null, reserved_account_bank: null }));
  }, []);

  // Profile Save
  const handleSaveProfile = async () => {
    if (!form.name.trim()) {
      toast('Name cannot be empty', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: form.name,
        language: form.language,
        phone: form.phone,
        handle: form.handle,
        location: form.location,
        bio: form.bio,
      });
      updateUser(res.data);
      toast('Profile updated successfully!', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not save your profile. Please try again.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
      toast('Please choose a JPG, PNG, or GIF image', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('Image must be under 5MB', 'error');
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.put('/auth/avatar', formData, { headers: { 'Content-Type': undefined } });
      updateUser(res.data);
      toast('Profile photo updated!', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not upload photo. Please try again.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Password Update
  const handlePasswordSubmit = async () => {
    if (!pwdForm.currentPassword || !pwdForm.newPassword) { 
      toast('Please enter your current and new password', 'error'); 
      return; 
    }
    if (pwdForm.newPassword.length < 6) {
      toast('New password must be at least 6 characters', 'error');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast('New passwords do not match', 'error');
      return;
    }
    setPwdLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast('Password changed successfully!', 'success');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast(err.response?.data?.message || 'Could not change password. Please try again.', 'error');
    } finally {
      setPwdLoading(false); 
    }
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    setNotifications(prev => ({ ...prev, [key]: newValue }));
    setSavingNotification(key);
    try {
      const res = await api.put('/auth/notification-preferences', { [key]: newValue });
      // Same staleness issue as display preferences — keep the cached user
      // object in sync so a reload doesn't silently revert this toggle.
      if (res.data?.notification_preferences) {
        updateUser({ notification_preferences: res.data.notification_preferences });
      }
      toast('Notification preference updated', 'success');
    } catch (err: any) {
      setNotifications(prev => ({ ...prev, [key]: !newValue }));
      toast(err?.response?.data?.message || 'Could not save preference.', 'error');
    } finally {
      setSavingNotification(null);
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
          
          {/* ─── PAGE HEADER ─── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
            <div>
              <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.color.text1, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
                Settings & User Profile
              </h1>
              <p style={{ fontSize: 13, color: theme.color.text3, margin: 0, fontWeight: 500 }}>
                Manage your profile details, security preferences, notification alerts, and billing accounts.
              </p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#C69A2C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '10px 22px',
                fontSize: 13,
                fontWeight: 800,
                cursor: savingProfile ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(198, 154, 44, 0.25)',
                fontFamily: F,
                transition: 'all 0.2s'
              }}
            >
              <Save size={14} />
              <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          {/* ─── TWO COLUMN SETTINGS LAYOUT ─── */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: 'row' }} className="settings-layout">
            
            {/* ─── LEFT SIDEBAR NAVIGATION ─── */}
            <div style={{ 
              flex: '0 0 240px', 
              background: theme.color.surface, 
              borderRadius: 20, 
              padding: '12px', 
              border: `1px solid ${theme.color.border}`, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 6 
            }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12, 
                      padding: '12px 16px', 
                      borderRadius: 12, 
                      border: isActive ? '1px solid #FDE68A' : '1px solid transparent', 
                      cursor: 'pointer', 
                      background: isActive ? '#FFFDF5' : 'transparent', 
                      color: isActive ? '#C69A2C' : '#475569', 
                      fontWeight: isActive ? 800 : 600, 
                      fontSize: 13, 
                      fontFamily: F, 
                      transition: 'all 0.15s', 
                      textAlign: 'left' 
                    }}
                  >
                    <Icon size={16} color={isActive ? '#C69A2C' : theme.color.text4} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ─── RIGHT MAIN CONTENT CONTAINER ─── */}
            <div style={{ flex: 1, minWidth: 0 }}>
              
              {/* ─── TAB 1: USER PROFILE ─── */}
              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <div style={{ background: theme.color.surface, borderRadius: 24, border: `1px solid ${theme.color.border}`, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: '0 0 20px', letterSpacing: '-0.3px' }}>
                      Profile Information
                    </h2>

                    {/* Avatar Banner */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${theme.color.surface2}` }}>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        style={{ display: 'none' }}
                        onChange={handleAvatarFileChange}
                      />
                      <div
                        onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
                        style={{
                          position: 'relative',
                          width: 76,
                          height: 76,
                          borderRadius: '50%',
                          background: user?.avatar ? 'transparent' : 'linear-gradient(135deg, #D4AF37 0%, #B49020 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 28,
                          fontWeight: 900,
                          color: '#FFFFFF',
                          boxShadow: '0 8px 24px rgba(180, 144, 32, 0.25)',
                          cursor: uploadingAvatar ? 'wait' : 'pointer',
                          overflow: 'hidden',
                        }}
                        className="group"
                        title="Click to change photo"
                      >
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          user?.name?.[0]?.toUpperCase() || 'C'
                        )}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: uploadingAvatar ? 1 : 0,
                          transition: 'opacity 0.2s',
                        }} className="group-hover:opacity-100">
                          {uploadingAvatar ? (
                            <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                          ) : (
                            <Camera color="#FFFFFF" size={20} />
                          )}
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: 0 }}>
                            {form.name || user?.name || 'Studio Arella Creator'}
                          </h3>
                          <span style={{ 
                            fontSize: 10, 
                            fontWeight: 800, 
                            color: '#C69A2C', 
                            background: '#FFFDF5', 
                            border: '1px solid #FDE68A', 
                            padding: '3px 10px', 
                            borderRadius: 20, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.06em' 
                          }}>
                            {user?.role || 'Creator'}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 6px' }}>{user?.email || 'creator@studioarella.com'}</p>
                        <p style={{ fontSize: 11, color: theme.color.text4, margin: 0, fontWeight: 500 }}>JPG, PNG or GIF up to 5MB. Recommended square 400x400.</p>
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
                      <Input 
                        label="Full Name" 
                        type="text" 
                        value={form.name} 
                        onChange={e => setForm({ ...form, name: e.target.value })} 
                      />

                      <Input 
                        label="Username / Handle" 
                        type="text" 
                        value={form.handle} 
                        onChange={e => setForm({ ...form, handle: e.target.value })} 
                      />

                      <div>
                        <Input 
                          label="Email Address" 
                          type="email" 
                          value={user?.email || 'creator@studioarella.com'} 
                          disabled 
                        />
                        <span style={{ fontSize: 11, color: theme.color.text4, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Lock size={10} /> Email address cannot be modified directly
                        </span>
                      </div>

                      <Input 
                        label="Phone Number" 
                        type="text" 
                        value={form.phone} 
                        onChange={e => setForm({ ...form, phone: e.target.value })} 
                      />

                      <Input 
                        label="Location / Base" 
                        type="text" 
                        value={form.location} 
                        onChange={e => setForm({ ...form, location: e.target.value })} 
                      />

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Preferred Language
                        </label>
                        <select 
                          value={form.language} 
                          onChange={e => setForm({ ...form, language: e.target.value })}
                          style={{ 
                            width: '100%', 
                            padding: '12px 14px', 
                            background: theme.color.surface, 
                            border: `1.5px solid ${theme.color.border}`, 
                            borderRadius: 12, 
                            fontSize: 13, 
                            fontFamily: F, 
                            color: theme.color.text1, 
                            outline: 'none', 
                            cursor: 'pointer' 
                          }}
                        >
                          <option value="en">English (US/UK)</option>
                          <option value="yo">Yoruba</option>
                          <option value="ig">Igbo</option>
                          <option value="ha">Hausa</option>
                        </select>
                      </div>
                    </div>

                    {/* Bio / Statement */}
                    <div style={{ marginBottom: 28 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Bio / Creator Statement
                      </label>
                      <textarea
                        rows={3}
                        value={form.bio}
                        onChange={e => setForm({ ...form, bio: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: theme.color.surface,
                          border: `1.5px solid ${theme.color.border}`,
                          borderRadius: 12,
                          fontSize: 13,
                          fontFamily: F,
                          color: theme.color.text1,
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        loading={savingProfile} 
                        loadingText="Saving Changes..." 
                        onClick={handleSaveProfile} 
                        style={{ background: '#C69A2C', color: '#FFFFFF', padding: '12px 28px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}
                      >
                        <Save size={14} /> Save Profile Details
                      </Button>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* ─── TAB 2: SECURITY & ACCESS ─── */}
              {activeTab === 'security' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  
                  {/* Password Card */}
                  <div style={{ background: theme.color.surface, borderRadius: 24, border: `1px solid ${theme.color.border}`, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <Lock size={18} color="#C69A2C" />
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: 0 }}>
                        Change Password
                      </h2>
                    </div>
                    <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 24px' }}>
                      Ensure your account is protected with a secure password containing letters, numbers, and symbols.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
                      <Input 
                        label="Current Password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={pwdForm.currentPassword} 
                        onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} 
                      />
                      <Input 
                        label="New Password" 
                        type="password" 
                        placeholder="Min 6 characters" 
                        value={pwdForm.newPassword} 
                        onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} 
                      />
                      <Input 
                        label="Confirm New Password" 
                        type="password" 
                        placeholder="Repeat new password" 
                        value={pwdForm.confirmPassword} 
                        onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} 
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        loading={pwdLoading} 
                        loadingText="Updating Password..." 
                        onClick={handlePasswordSubmit} 
                        style={{ background: theme.color.charcoal900, color: '#FFFFFF', padding: '12px 24px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}
                      >
                        <Key size={14} /> Update Password
                      </Button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div style={{ background: theme.color.surface, borderRadius: 24, border: `1px solid ${theme.color.border}`, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <Smartphone size={18} color="#C69A2C" />
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: theme.color.text1, margin: 0 }}>
                            Two-Factor Authentication (2FA)
                          </h3>
                        </div>
                        <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>
                          Add an extra layer of security requiring an authenticator code when signing in.
                        </p>
                      </div>

                      <button
                        onClick={() => { if (twoFactorEnabled) setShow2FADisable(true); else setShow2FAPasswordPrompt(true); }}
                        disabled={setting2FA}
                        style={{
                          width: 48,
                          height: 26,
                          borderRadius: 20,
                          background: twoFactorEnabled ? '#10B981' : theme.color.border2,
                          position: 'relative',
                          border: 'none',
                          cursor: setting2FA ? 'wait' : 'pointer',
                          padding: 0,
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: theme.color.surface,
                          position: 'absolute',
                          top: 3,
                          left: twoFactorEnabled ? 25 : 3,
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </button>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div style={{ background: theme.color.surface, borderRadius: 24, border: `1px solid ${theme.color.border}`, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: theme.color.text1, margin: '0 0 16px' }}>
                      Active Logged-in Devices
                    </h3>

                    {loadingSessions ? (
                      <p style={{ fontSize: 13, color: theme.color.text3 }}>Loading sessions…</p>
                    ) : sessions.length === 0 ? (
                      <p style={{ fontSize: 13, color: theme.color.text3 }}>No active sessions found.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {(showAllSessions ? sessions : sessions.slice(0, SESSIONS_PREVIEW_COUNT)).map((s) => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: s.is_current ? theme.color.bg : theme.color.surface, borderRadius: 14, border: `1px solid ${theme.color.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {s.device.includes('iOS') || s.device.includes('Android') ? <Smartphone size={20} color={theme.color.text3} /> : <Laptop size={20} color={theme.color.text1} />}
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 800, color: theme.color.text1, margin: '0 0 2px' }}>
                                  {s.device}{s.is_current ? ' · Current Session' : ''}
                                </p>
                                <p style={{ fontSize: 11, color: theme.color.text3, margin: 0 }}>
                                  IP: {s.ip_address} · {s.is_current ? 'Active now' : `Last seen ${new Date(s.last_active_at).toLocaleString()}`}
                                </p>
                              </div>
                            </div>
                            {s.is_current ? (
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: 20 }}>
                                Active Now
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRevokeSession(s.id)}
                                style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        ))}
                        {sessions.length > SESSIONS_PREVIEW_COUNT && (
                          <button
                            onClick={() => setShowAllSessions((v) => !v)}
                            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: theme.color.gold, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '4px 0', fontFamily: F }}
                          >
                            {showAllSessions ? 'Show fewer devices' : `Show all ${sessions.length} devices`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Danger Zone */}
                  <div style={{ background: '#FFF1F2', borderRadius: 24, border: '1px solid #FECDD3', padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <AlertTriangle size={18} color="#E11D48" />
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#BE123C', margin: 0 }}>
                        Danger Zone
                      </h3>
                    </div>
                    <p style={{ fontSize: 13, color: '#9F1239', margin: '0 0 20px', lineHeight: 1.5 }}>
                      Permanently delete your account, booked billboard slots, podcast episodes, and all associated analytics data. This action cannot be reversed.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      style={{
                        background: '#E11D48',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 10,
                        padding: '10px 20px',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontFamily: F
                      }}
                    >
                      Delete Account
                    </button>
                  </div>

                </motion.div>
              )}

              {/* ─── TAB 3: NOTIFICATIONS ─── */}
              {activeTab === 'notifications' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <div style={{ background: theme.color.surface, borderRadius: 24, border: `1px solid ${theme.color.border}`, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                      Notification Preferences
                    </h2>
                    <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 28px' }}>
                      Choose how Studio Arella delivers your broadcast updates, booking confirmations, and financial receipts.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {[
                        { key: 'emailBookings', title: 'Ad Booking Confirmations', desc: 'Receive instant email confirmation whenever an Ad slot or podcast session is booked.' },
                        { key: 'emailBroadcasts', title: 'Live Broadcast Completion Alerts', desc: 'Get notified as soon as your ad goes live on the digital billboard screens.' },
                        { key: 'emailWallet', title: 'Wallet Funding & Debit Receipts', desc: 'Detailed invoice sent to your email upon every top-up or broadcast deduction.' },
                        { key: 'emailWeekly', title: 'Weekly Performance Digest', desc: 'Weekly summary of total impressions, viewer counts, and podcast engagements.' },
                        { key: 'smsAlerts', title: 'Critical SMS Alerts', desc: 'Direct text messages for last-minute booking reschedules or airtime approvals.' },
                        { key: 'smsSecurity', title: 'Security & Sign-in Alerts', desc: 'SMS notifications for new logins from unrecognized devices.' },
                      ].map(item => {
                        const isChecked = notifications[item.key as keyof typeof notifications];
                        return (
                          <div 
                            key={item.key}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              paddingBottom: 20, 
                              borderBottom: `1px solid ${theme.color.surface2}` 
                            }}
                          >
                            <div style={{ paddingRight: 24 }}>
                              <h4 style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: '0 0 3px' }}>
                                {item.title}
                              </h4>
                              <p style={{ fontSize: 12, color: theme.color.text3, margin: 0, lineHeight: 1.4 }}>
                                {item.desc}
                              </p>
                            </div>

                            <button
                              onClick={() => toggleNotification(item.key as keyof typeof notifications)}
                              style={{
                                width: 44,
                                height: 24,
                                borderRadius: 20,
                                background: isChecked ? '#C69A2C' : theme.color.border2,
                                position: 'relative',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                flexShrink: 0,
                                transition: 'background 0.2s'
                              }}
                            >
                              <div style={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                background: theme.color.surface,
                                position: 'absolute',
                                top: 3,
                                left: isChecked ? 23 : 3,
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                              }} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── TAB 4: BILLING & INVOICING ─── */}
              {activeTab === 'billing' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  
                  {/* Balance Summary Card */}
                  <div style={{ 
                    background: 'linear-gradient(145deg, #D4AF37 0%, #B49020 100%)', 
                    borderRadius: 24, 
                    padding: '28px 32px', 
                    color: '#FFFFFF', 
                    boxShadow: '0 10px 30px rgba(180, 144, 32, 0.25)', 
                    position: 'relative', 
                    overflow: 'hidden' 
                  }}>
                    <div style={{ position: 'absolute', bottom: -24, right: -24, width: 120, height: 120, background: '#FDE68A', borderRadius: '50%', opacity: 0.8 }} />

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)' }}>
                          Available Broadcast Balance
                        </span>
                        <h2 style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', margin: '4px 0 6px', letterSpacing: '-0.5px' }}>
                          {billing ? `₦${billing.credits.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Loading…'}
                        </h2>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 600 }}>
                          Manage top-ups and transaction history from your Wallet
                        </p>
                      </div>

                      <Link
                        href="/finances"
                        style={{
                          background: theme.color.charcoal900,
                          color: '#FFFFFF',
                          padding: '10px 20px',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <span>Manage Wallet</span>
                        <ExternalLink size={13} />
                      </Link>
                    </div>
                  </div>

                  {/* Dedicated Virtual Bank Account Card */}
                  <div style={{ background: theme.color.surface, borderRadius: 24, border: `1px solid ${theme.color.border}`, padding: '28px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <Building2 size={18} color="#C69A2C" />
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: theme.color.text1, margin: 0 }}>
                        Dedicated Permanent Bank Account
                      </h3>
                    </div>

                    {billing?.reserved_account_number ? (
                      <>
                        <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 20px' }}>
                          Transfers sent to this personalized account from any Nigerian bank will automatically fund your Studio Arella wallet.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, padding: '18px 20px', background: theme.color.bg, borderRadius: 14, border: `1px solid ${theme.color.border}` }}>
                          <div>
                            <span style={{ fontSize: 11, color: theme.color.text4, fontWeight: 700, textTransform: 'uppercase' }}>Bank Name</span>
                            <p style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: '4px 0 0' }}>{billing.reserved_account_bank}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: 11, color: theme.color.text4, fontWeight: 700, textTransform: 'uppercase' }}>Account Number</span>
                            <p style={{ fontSize: 15, fontWeight: 900, color: theme.color.text1, margin: '4px 0 0', fontFamily: 'monospace' }}>{billing.reserved_account_number}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: 11, color: theme.color.text4, fontWeight: 700, textTransform: 'uppercase' }}>Beneficiary</span>
                            <p style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: '4px 0 0' }}>Studio Arella / {user?.name || 'Creator'}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 16px' }}>
                          You haven't generated a dedicated account yet. Verify your BVN or NIN on the Wallet page to get one.
                        </p>
                        <Link href="/finances" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: theme.color.gold, textDecoration: 'none' }}>
                          Set up on Wallet <ExternalLink size={13} />
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Payment Methods on file */}
                  <div style={{ background: theme.color.surface, borderRadius: 24, border: `1px solid ${theme.color.border}`, padding: '28px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: theme.color.text1, margin: '0 0 6px' }}>
                      Saved Cards
                    </h3>
                    <p style={{ fontSize: 12, color: theme.color.text4, margin: '0 0 16px' }}>
                      Cards are saved automatically the next time you pay by card at checkout.
                    </p>

                    {loadingCards ? (
                      <p style={{ fontSize: 13, color: theme.color.text3 }}>Loading…</p>
                    ) : savedCards.length === 0 ? (
                      <p style={{ fontSize: 13, color: theme.color.text3 }}>No saved cards yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {savedCards.map((c) => (
                          <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: theme.color.bg, borderRadius: 12, border: `1px solid ${theme.color.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <CreditCard size={18} color={theme.color.text1} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: theme.color.text1, textTransform: 'capitalize' }}>
                                {c.card_type || 'Card'} ending in {c.last4 || '····'}{c.bank ? ` · ${c.bank}` : ''}
                              </span>
                            </div>
                            <button onClick={() => handleDeleteCard(c.id)} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </motion.div>
              )}

              {/* ─── TAB 5: PREFERENCES ─── */}
              {activeTab === 'preferences' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <div style={{ background: theme.color.surface, borderRadius: 24, border: `1px solid ${theme.color.border}`, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                      Workspace Preferences
                    </h2>
                    <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 28px' }}>
                      Customize your regional formatting, display currency, and workspace experience.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      
                      {/* Currency Selection */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20, borderBottom: `1px solid ${theme.color.surface2}` }}>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: '0 0 3px' }}>
                            Display Currency
                          </h4>
                          <p style={{ fontSize: 12, color: theme.color.text3, margin: 0 }}>
                            Select the primary currency shown across dashboards and booking invoices.
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {SUPPORTED_CURRENCIES.map(curr => (
                            <button
                              key={curr}
                              disabled={savingPreference === 'currency'}
                              onClick={() => { setCurrency(curr); saveDisplayPreference({ currency: curr }, 'currency'); toast(`Currency set to ${curr}`, 'success'); }}
                              style={{
                                padding: '8px 16px',
                                borderRadius: 10,
                                border: currency === curr ? '1.5px solid #C69A2C' : `1px solid ${theme.color.border}`,
                                background: currency === curr ? '#FFFDF5' : '#FFFFFF',
                                color: currency === curr ? '#C69A2C' : '#475569',
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: savingPreference === 'currency' ? 'not-allowed' : 'pointer',
                                opacity: savingPreference === 'currency' ? 0.6 : 1,
                                fontFamily: F
                              }}
                            >
                              {CURRENCY_LABELS[curr]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Timezone Selection */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20, borderBottom: `1px solid ${theme.color.surface2}` }}>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: '0 0 3px' }}>
                            Display Timezone
                          </h4>
                          <p style={{ fontSize: 12, color: theme.color.text3, margin: 0 }}>
                            Dates and times shown to you use this zone. Ad slots and podcast sessions are still scheduled in real West Africa Time regardless of this setting.
                          </p>
                        </div>
                        <select
                          value={timezone}
                          disabled={savingPreference === 'timezone'}
                          onChange={e => { setTimezone(e.target.value); saveDisplayPreference({ timezone: e.target.value }, 'timezone'); }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 10,
                            border: `1px solid ${theme.color.border}`,
                            background: theme.color.surface,
                            fontSize: 12,
                            fontWeight: 700,
                            color: theme.color.text1,
                            fontFamily: F,
                            outline: 'none'
                          }}
                        >
                          {SUPPORTED_TIMEZONES.map((tz) => (
                            <option key={tz} value={tz}>{TIMEZONE_LABELS[tz]}</option>
                          ))}
                        </select>
                      </div>

                      {/* Audio Feedback */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: '0 0 3px' }}>
                            Sound Effects & Micro-Audio
                          </h4>
                          <p style={{ fontSize: 12, color: theme.color.text3, margin: 0 }}>
                            Play subtle audio feedback when confirming ad slot reservations and cart additions.
                          </p>
                        </div>
                        <button
                          disabled={savingPreference === 'sound'}
                          onClick={() => { const next = !soundEnabled; setSoundEnabled(next); saveDisplayPreference({ sound_enabled: next }, 'sound'); }}
                          style={{
                            width: 44,
                            height: 24,
                            borderRadius: 20,
                            background: soundEnabled ? '#C69A2C' : theme.color.border2,
                            opacity: savingPreference === 'sound' ? 0.6 : 1,
                            position: 'relative',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            flexShrink: 0,
                            transition: 'background 0.2s'
                          }}
                        >
                          <div style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: theme.color.surface,
                            position: 'absolute',
                            top: 3,
                            left: soundEnabled ? 23 : 3,
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                          }} />
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </div>

        </div>

        {/* ─── MODAL: 2FA SETUP — PASSWORD CONFIRM ─── */}
        <AnimatePresence>
          {show2FAPasswordPrompt && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { setShow2FAPasswordPrompt(false); setStart2FAPassword(''); }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 380, pointerEvents: 'auto' }}>
                  <div style={{ background: theme.color.surface, borderRadius: 24, padding: '32px 28px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: '0 0 8px' }}>
                      Confirm your password
                    </h3>
                    <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 20px', lineHeight: 1.5 }}>
                      Enter your password to start setting up two-factor authentication.
                    </p>
                    <input
                      type="password"
                      placeholder="Your password"
                      value={start2FAPassword}
                      onChange={(e) => setStart2FAPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleStart2FASetup(); }}
                      autoFocus
                      style={{ width: '100%', padding: '12px 14px', marginBottom: 20, borderRadius: 10, border: `1.5px solid ${theme.color.border}`, fontSize: 13, fontFamily: F, color: theme.color.text1, background: theme.color.bg, outline: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button onClick={() => { setShow2FAPasswordPrompt(false); setStart2FAPassword(''); }} variant="secondary" style={{ flex: 1 }}>Cancel</Button>
                      <Button onClick={handleStart2FASetup} loading={setting2FA} loadingText="Starting..." style={{ flex: 1 }}>Continue</Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ─── MODAL: 2FA SETUP ─── */}
        <AnimatePresence>
          {show2FASetup && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { setShow2FASetup(false); setTwoFactorCode(''); }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 400, pointerEvents: 'auto' }}>
                  <div style={{ background: theme.color.surface, borderRadius: 24, padding: '32px 28px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: '0 0 8px' }}>
                      Set up two-factor authentication
                    </h3>
                    <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 20px', lineHeight: 1.5 }}>
                      Scan this QR code with Google Authenticator, Authy, or any TOTP app, then enter the 6-digit code it shows.
                    </p>
                    {qrCode && (
                      <img src={qrCode} alt="2FA QR code" style={{ width: 180, height: 180, margin: '0 auto 12px', borderRadius: 12, border: `1px solid ${theme.color.border}` }} />
                    )}
                    <p style={{ fontSize: 11, color: theme.color.text4, margin: '0 0 20px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      Manual key: {manualKey}
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', padding: '12px 14px', marginBottom: 20, borderRadius: 10, border: `1.5px solid ${theme.color.border}`, fontSize: 20, letterSpacing: 6, textAlign: 'center', fontFamily: F, color: theme.color.text1, background: theme.color.bg, outline: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button onClick={() => { setShow2FASetup(false); setTwoFactorCode(''); }} variant="secondary" style={{ flex: 1 }}>Cancel</Button>
                      <Button onClick={handleConfirm2FASetup} loading={setting2FA} loadingText="Verifying..." style={{ flex: 1 }}>Verify & Enable</Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ─── MODAL: 2FA DISABLE ─── */}
        <AnimatePresence>
          {show2FADisable && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { setShow2FADisable(false); setDisable2FAPassword(''); }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 380, pointerEvents: 'auto' }}>
                  <div style={{ background: theme.color.surface, borderRadius: 24, padding: '32px 28px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: '0 0 8px' }}>
                      Disable two-factor authentication?
                    </h3>
                    <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 20px', lineHeight: 1.5 }}>
                      Your account will be less secure. Enter your password to confirm.
                    </p>
                    <input
                      type="password"
                      placeholder="Your password"
                      value={disable2FAPassword}
                      onChange={(e) => setDisable2FAPassword(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', marginBottom: 20, borderRadius: 10, border: `1.5px solid ${theme.color.border}`, fontSize: 13, fontFamily: F, color: theme.color.text1, background: theme.color.bg, outline: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button onClick={() => { setShow2FADisable(false); setDisable2FAPassword(''); }} variant="secondary" style={{ flex: 1 }}>Cancel</Button>
                      <button onClick={handleDisable2FA} disabled={disabling2FA} style={{ flex: 1, padding: '12px', background: '#E11D48', color: '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: disabling2FA ? 'not-allowed' : 'pointer', opacity: disabling2FA ? 0.7 : 1, fontFamily: F }}>
                        {disabling2FA ? 'Disabling…' : 'Disable 2FA'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ─── MODAL: CONFIRM ACCOUNT DELETION ─── */}
        <AnimatePresence>
          {showDeleteModal && (
            <>
              <motion.div 
                key="del-bd" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteModal(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} 
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div 
                  key="del-card"
                  initial={{ opacity: 0, scale: 0.94, y: 16 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }} 
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 420, pointerEvents: 'auto' }}
                >
                  <div style={{ background: theme.color.surface, borderRadius: 24, padding: '32px 28px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF1F2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <AlertTriangle size={26} color="#E11D48" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: '0 0 8px' }}>
                      Delete your account?
                    </h3>
                    <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 16px', lineHeight: 1.5 }}>
                      Your account will be deactivated immediately and you'll be signed out. This cannot be undone.
                    </p>
                    <input
                      type="password"
                      placeholder="Enter your password to confirm"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', marginBottom: 20, borderRadius: 10, border: `1.5px solid ${theme.color.border}`, fontSize: 13, fontFamily: F, color: theme.color.text1, background: theme.color.bg, outline: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }} variant="secondary" style={{ flex: 1 }}>
                        Cancel
                      </Button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#E11D48',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: deletingAccount ? 'not-allowed' : 'pointer',
                          opacity: deletingAccount ? 0.7 : 1,
                          fontFamily: F
                        }}
                      >
                        {deletingAccount ? 'Deleting…' : 'Confirm Delete'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ─── FLOATING "CHAT WITH ARELLA 🌐" WIDGET ─── */}
        <div className="chat-fab-widget" style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 90 }}>
          <div style={{ position: 'relative' }}>
            <Link
              href="/chat"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 24px',
                background: theme.color.surface,
                border: `1px solid ${theme.color.border}`,
                borderRadius: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                textDecoration: 'none',
                color: '#1E293B',
                fontSize: 13,
                fontWeight: 700,
                transition: 'all 0.2s',
                fontFamily: F
              }}
            >
              <span className="chat-fab-label">Chat with Arella</span>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)', padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', background: theme.color.surface, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={13} color="#4F46E5" />
                </div>
              </div>
            </Link>
            {/* Speech bubble tail */}
            <div style={{
              position: 'absolute',
              bottom: -7,
              right: 28,
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '8px solid #FFFFFF',
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.04))',
              pointerEvents: 'none'
            }} />
          </div>
        </div>

      </PageTransition>
      <style dangerouslySetInnerHTML={{__html:`
        @media (max-width: 768px) {
          .settings-layout { flex-direction: column !important; }
          .settings-layout > div:first-child { width: 100%; flex: none !important; }
        }
      `}} />
    </DashboardLayout>
  );
}
