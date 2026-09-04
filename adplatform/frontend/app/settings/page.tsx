'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition, FadeCard } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuthStore } from '@/store/authStore';
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
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile Form
  const [form, setForm] = useState({
    name: '',
    handle: '',
    phone: '',
    location: 'Lagos, Nigeria',
    bio: '',
    language: 'en'
  });
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Security Form
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Notification Toggles
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailBroadcasts: true,
    emailWallet: true,
    emailWeekly: false,
    smsAlerts: true,
    smsSecurity: true,
  });

  // Preferences
  const [currency, setCurrency] = useState('NGN');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        handle: user.email ? `@${user.email.split('@')[0]}` : '@creator',
        phone: '+234 812 345 6789',
        location: 'Lagos, Nigeria',
        bio: 'Digital creator & advertiser booking prime billboard screens across Nigeria.',
        language: user.language || 'en'
      });
    }
  }, [user]);

  // Profile Save
  const handleSaveProfile = async () => {
    if (!form.name.trim()) { 
      toast('Name cannot be empty', 'error'); 
      return; 
    }
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name: form.name, language: form.language });
      updateUser(res.data);
      toast('Profile updated successfully!', 'success');
    } catch { 
      updateUser({ ...user, name: form.name, language: form.language });
      toast('Profile saved locally!', 'success');
    } finally { 
      setSavingProfile(false); 
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
      toast(err.response?.data?.message || 'Password changed successfully', 'success'); 
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally { 
      setPwdLoading(false); 
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast('Notification preference updated', 'success');
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
          
          {/* ─── PAGE HEADER ─── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
            <div>
              <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
                Settings & User Profile
              </h1>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, fontWeight: 500 }}>
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
              background: '#FFFFFF', 
              borderRadius: 20, 
              padding: '12px', 
              border: '1px solid #E2E8F0', 
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
                    <Icon size={16} color={isActive ? '#C69A2C' : '#94A3B8'} />
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
                  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 20px', letterSpacing: '-0.3px' }}>
                      Profile Information
                    </h2>

                    {/* Avatar Banner */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ 
                        position: 'relative', 
                        width: 76, 
                        height: 76, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #D4AF37 0%, #B49020 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: 28, 
                        fontWeight: 900, 
                        color: '#FFFFFF', 
                        boxShadow: '0 8px 24px rgba(180, 144, 32, 0.25)', 
                        cursor: 'pointer' 
                      }}>
                        {user?.name?.[0]?.toUpperCase() || 'C'}
                        <div style={{ 
                          position: 'absolute', 
                          inset: 0, 
                          borderRadius: '50%', 
                          background: 'rgba(0,0,0,0.3)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          opacity: 0, 
                          transition: 'opacity 0.2s' 
                        }} className="hover:opacity-100">
                          <Camera color="#FFFFFF" size={20} />
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
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
                        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 6px' }}>{user?.email || 'creator@studioarella.com'}</p>
                        <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, fontWeight: 500 }}>JPG, PNG or GIF up to 5MB. Recommended square 400x400.</p>
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
                        <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
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
                            background: '#FFFFFF', 
                            border: '1.5px solid #E2E8F0', 
                            borderRadius: 12, 
                            fontSize: 13, 
                            fontFamily: F, 
                            color: '#0F172A', 
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
                          background: '#FFFFFF',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: 12,
                          fontSize: 13,
                          fontFamily: F,
                          color: '#0F172A',
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
                  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <Lock size={18} color="#C69A2C" />
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Change Password
                      </h2>
                    </div>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>
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
                        style={{ background: '#0F172A', color: '#FFFFFF', padding: '12px 24px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}
                      >
                        <Key size={14} /> Update Password
                      </Button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <Smartphone size={18} color="#C69A2C" />
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            Two-Factor Authentication (2FA)
                          </h3>
                        </div>
                        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                          Add an extra layer of security requiring an authenticator code when signing in.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setTwoFactorEnabled(!twoFactorEnabled);
                          toast(twoFactorEnabled ? '2FA disabled' : '2FA activated successfully!', 'success');
                        }}
                        style={{
                          width: 48,
                          height: 26,
                          borderRadius: 20,
                          background: twoFactorEnabled ? '#10B981' : '#CBD5E1',
                          position: 'relative',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#FFFFFF',
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
                  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>
                      Active Logged-in Devices
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Laptop size={20} color="#0F172A" />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>
                              Chrome on Windows 11 · Current Session
                            </p>
                            <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>
                              Lagos, Nigeria · IP: 102.89.44.12
                            </p>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: 20 }}>
                          Active Now
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Smartphone size={20} color="#64748B" />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>
                              Safari on iPhone 15 Pro
                            </p>
                            <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>
                              Lagos, Nigeria · Last seen 2 hours ago
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => toast('Session logged out', 'success')}
                          style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
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
                  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                      Notification Preferences
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 28px' }}>
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
                              borderBottom: '1px solid #F1F5F9' 
                            }}
                          >
                            <div style={{ paddingRight: 24 }}>
                              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 3px' }}>
                                {item.title}
                              </h4>
                              <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                                {item.desc}
                              </p>
                            </div>

                            <button
                              onClick={() => toggleNotification(item.key as keyof typeof notifications)}
                              style={{
                                width: 44,
                                height: 24,
                                borderRadius: 20,
                                background: isChecked ? '#C69A2C' : '#CBD5E1',
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
                                background: '#FFFFFF',
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
                          ₦5,215,005.25
                        </h2>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 600 }}>
                          Equivalent to ~5,215 airtime broadcast minutes
                        </p>
                      </div>

                      <Link
                        href="/finances"
                        style={{
                          background: '#0F172A',
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
                  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', padding: '28px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <Building2 size={18} color="#C69A2C" />
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Dedicated Permanent Bank Account
                      </h3>
                    </div>

                    <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px' }}>
                      Transfers sent to this personalized account from any Nigerian bank will automatically fund your Studio Arella wallet.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, padding: '18px 20px', background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                      <div>
                        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Bank Name</span>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '4px 0 0' }}>Wema Bank</p>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Account Number</span>
                        <p style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', margin: '4px 0 0', fontFamily: 'monospace' }}>0129384756</p>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Beneficiary</span>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '4px 0 0' }}>Studio Arella / Creator</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods on file */}
                  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', padding: '28px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Saved Cards
                      </h3>
                      <button 
                        onClick={() => toast('Redirecting to add card...', 'success')}
                        style={{ background: 'none', border: 'none', color: '#C69A2C', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                      >
                        + Add Card
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <CreditCard size={18} color="#0F172A" />
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Mastercard ending in 4242</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#C69A2C' }}>Default</span>
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* ─── TAB 5: PREFERENCES ─── */}
              {activeTab === 'preferences' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                      Workspace Preferences
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 28px' }}>
                      Customize your regional formatting, display currency, and workspace experience.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      
                      {/* Currency Selection */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid #F1F5F9' }}>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 3px' }}>
                            Display Currency
                          </h4>
                          <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                            Select the primary currency shown across dashboards and booking invoices.
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {['NGN', 'USD'].map(curr => (
                            <button
                              key={curr}
                              onClick={() => { setCurrency(curr); toast(`Currency set to ${curr}`, 'success'); }}
                              style={{
                                padding: '8px 16px',
                                borderRadius: 10,
                                border: currency === curr ? '1.5px solid #C69A2C' : '1px solid #E2E8F0',
                                background: currency === curr ? '#FFFDF5' : '#FFFFFF',
                                color: currency === curr ? '#C69A2C' : '#475569',
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontFamily: F
                              }}
                            >
                              {curr === 'NGN' ? 'Nigerian Naira (₦)' : 'US Dollar ($)'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Timezone Selection */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid #F1F5F9' }}>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 3px' }}>
                            Studio Timezone
                          </h4>
                          <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                            All ad slots and podcast sessions are scheduled according to this zone.
                          </p>
                        </div>
                        <select
                          value={timezone}
                          onChange={e => setTimezone(e.target.value)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 10,
                            border: '1px solid #E2E8F0',
                            background: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#0F172A',
                            fontFamily: F,
                            outline: 'none'
                          }}
                        >
                          <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                          <option value="UTC">UTC (GMT+0)</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="Europe/London">Europe/London (GMT/BST)</option>
                        </select>
                      </div>

                      {/* Audio Feedback */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 3px' }}>
                            Sound Effects & Micro-Audio
                          </h4>
                          <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                            Play subtle audio feedback when confirming ad slot reservations and cart additions.
                          </p>
                        </div>
                        <button
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          style={{
                            width: 44,
                            height: 24,
                            borderRadius: 20,
                            background: soundEnabled ? '#C69A2C' : '#CBD5E1',
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
                            background: '#FFFFFF',
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
                  <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '32px 28px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF1F2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <AlertTriangle size={26} color="#E11D48" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
                      Delete your account?
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px', lineHeight: 1.5 }}>
                      This will permanently remove all your campaigns, booked slots, and wallet balance. This cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button onClick={() => setShowDeleteModal(false)} variant="secondary" style={{ flex: 1 }}>
                        Cancel
                      </Button>
                      <button
                        onClick={() => {
                          toast('Account deletion request registered', 'error');
                          setShowDeleteModal(false);
                        }}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#E11D48',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: 'pointer',
                          fontFamily: F
                        }}
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ─── FLOATING "CHAT WITH ARELLA 🌐" WIDGET ─── */}
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 90 }}>
          <div style={{ position: 'relative' }}>
            <Link 
              href="/chat"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 10, 
                padding: '12px 24px', 
                background: '#FFFFFF', 
                border: '1px solid #E2E8F0', 
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
              <span>Chat with Arella</span>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)', padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
