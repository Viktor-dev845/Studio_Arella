'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, 
  Mic, 
  Palette, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Building2, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Copy,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { theme } from '@/lib/theme';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';

const F = theme.font.body;

function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div 
          key={i} 
          animate={{ flex: i + 1 === step ? 2.5 : 1 }}
          transition={{ duration: 0.3 }}
          style={{ 
            height: 4, 
            borderRadius: 2, 
            background: i < step ? '#C69A2C' : '#E2E8F0', 
            transition: 'background 0.3s' 
          }} 
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const { user, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['screen']);
  const [campaignName, setCampaignName] = useState('');
  const [objective, setObjective] = useState('Brand Awareness');
  const [budget, setBudget] = useState('₦50k – ₦200k');
  const [saving, setSaving] = useState(false);
  const [copiedAcct, setCopiedAcct] = useState(false);

  useEffect(() => {
    loadFromStorage();
    const t = localStorage.getItem('token');
    if (!t && typeof window !== 'undefined') {
      // Allow previewing onboarding even if token is not set
    }
  }, []);

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(g => g !== id) : prev) 
        : [...prev, id]
    );
  };

  const handleStep2Submit = async () => {
    setSaving(true);
    try {
      if (campaignName.trim()) {
        await api.post('/campaigns', { 
          name: campaignName, 
          budget: budget.includes('500k') ? 500000 : budget.includes('200k') ? 200000 : 50000 
        });
      }
    } catch {
      // Fallback continuation
    } finally {
      setSaving(false);
      setStep(3);
    }
  };

  const handleCopyAccount = (acct: string) => {
    navigator.clipboard.writeText(acct);
    setCopiedAcct(true);
    toast('Dedicated account number copied to clipboard', 'success');
    setTimeout(() => setCopiedAcct(false), 3000);
  };

  const GOAL_CARDS = [
    { 
      id: 'screen', 
      title: 'Digital Screen Billboard Ads', 
      desc: 'Broadcast 4K high-impact video ads across prime roadside terminals in Umuahia & Lagos.', 
      icon: Tv,
      color: '#C69A2C',
      badge: 'High Traffic' 
    },
    { 
      id: 'podcast', 
      title: 'Podcast Studio Sessions', 
      desc: 'Book state-of-the-art acoustic studios with 4K multi-camera filming and audio mastering.', 
      icon: Mic,
      color: '#8B5CF6',
      badge: 'Pro Audio' 
    },
    { 
      id: 'creative', 
      title: 'Creative Production Services', 
      desc: 'Work directly with our in-house directors and editors to film and animate your brand campaign.', 
      icon: Palette,
      color: '#0284C7',
      badge: 'Design & Film' 
    },
  ];

  const BUDGETS = ['Under ₦50,000', '₦50k – ₦200k', '₦200k – ₦500k', '₦500,000+'];

  return (
    <div style={{ fontFamily: F, minHeight: '100vh', background: '#F8FAFC', display: 'flex', position: 'relative' }}>
      
      {/* ─── LEFT HERO BRAND PANEL (DESKTOP) ─── */}
      <div 
        className="hidden lg:flex" 
        style={{ 
          flex: '0 0 460px', 
          flexDirection: 'column', 
          padding: '56px 48px', 
          position: 'relative', 
          overflow: 'hidden', 
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF'
        }}
      >
        {/* Ambient Gold Radial Orbs */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 320, height: 320, background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, background: 'radial-gradient(circle, rgba(198,154,44,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: 48 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo-white.png" alt="Studio Arella" style={{ height: 100, objectFit: 'contain' }} />
          </Link>
        </div>

        {/* Hero Title & Subtext */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', padding: '4px 12px', borderRadius: 20, marginBottom: 16 }}>
            <Sparkles size={12} color="#E3C762" />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#E3C762', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Welcome to Studio Arella
            </span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-1px', lineHeight: 1.2, margin: '0 0 14px' }}>
            Your creative vision, amplified.
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            Nigeria's leading media network for high-impact digital billboard broadcasting, professional podcast recording, and broadcast monetization.
          </p>
        </div>

        {/* Highlight Badges */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tv size={18} color="#C69A2C" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', margin: '0 0 2px' }}>Prime 4K Digital Terminals</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Over 15,000 daily commuters reach</p>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={18} color="#A78BFA" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', margin: '0 0 2px' }}>Acoustic Broadcast Studios</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>4K multi-cam audio and video mastering</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT INTERACTIVE FORM CONTAINER ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
        
        {/* Mobile Logo Header */}
        <div style={{ position: 'absolute', top: 24, left: 24 }} className="lg:hidden">
          <Link href="/">
            <img src="/logo.png" alt="Studio Arella" style={{ height: 60, objectFit: 'contain' }} />
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: 480 }}>
          
          <StepProgress step={step} total={4} />

          <AnimatePresence mode="wait">
            
            {/* ─── STEP 1: SELECT GOALS & NEEDS ─── */}
            {step === 1 && (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, y: 12 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -12 }} 
                transition={{ duration: 0.22 }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, color: '#C69A2C', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Step 1 of 4 · Welcome
                </span>
                <h2 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                  What brings you to Studio Arella{user?.name ? `, ${user.name.split(' ')[0]}` : ''}?
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px', lineHeight: 1.5 }}>
                  Select the solutions you plan to use. You can access all tools freely anytime.
                </p>

                {/* Goal Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {GOAL_CARDS.map(goal => {
                    const isSelected = selectedGoals.includes(goal.id);
                    const Icon = goal.icon;
                    return (
                      <div
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        style={{
                          background: isSelected ? '#FFFDF5' : '#FFFFFF',
                          border: isSelected ? '1.5px solid #C69A2C' : '1px solid #E2E8F0',
                          borderRadius: 16,
                          padding: '16px 18px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          boxShadow: isSelected ? '0 4px 16px rgba(198, 154, 44, 0.12)' : 'none',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: isSelected ? '#FFFDF5' : '#F8FAFC',
                          border: `1px solid ${isSelected ? '#FDE68A' : '#E2E8F0'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Icon size={18} color={isSelected ? '#C69A2C' : '#64748B'} />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                              {goal.title}
                            </h4>
                            <span style={{ fontSize: 10, fontWeight: 700, color: goal.color, background: '#F8FAFC', padding: '2px 8px', borderRadius: 10 }}>
                              {goal.badge}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                            {goal.desc}
                          </p>
                        </div>

                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: isSelected ? 'none' : '2px solid #CBD5E1',
                          background: isSelected ? '#C69A2C' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#C69A2C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(198, 154, 44, 0.25)',
                      fontFamily: F
                    }}
                  >
                    <span>Continue to Setup</span>
                    <ArrowRight size={15} />
                  </button>

                  <Link 
                    href="/dashboard"
                    style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Skip to dashboard
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2: CREATE FIRST CAMPAIGN / PROJECT ─── */}
            {step === 2 && (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, y: 12 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -12 }} 
                transition={{ duration: 0.22 }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, color: '#C69A2C', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Step 2 of 4 · Campaign Setup
                </span>
                <h2 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                  Set up your first campaign
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px', lineHeight: 1.5 }}>
                  Define your advertising objectives and target budget tier. You can modify these anytime.
                </p>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '22px', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                      Campaign / Project Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Q3 Brand Launch — Bems Highway" 
                      value={campaignName}
                      onChange={e => setCampaignName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#F8FAFC',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: 10,
                        fontSize: 13,
                        color: '#0F172A',
                        outline: 'none',
                        fontFamily: F
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                      Primary Objective
                    </label>
                    <select
                      value={objective}
                      onChange={e => setObjective(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#F8FAFC',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: 10,
                        fontSize: 13,
                        color: '#0F172A',
                        outline: 'none',
                        fontFamily: F,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Brand Awareness">Brand Awareness & Highway Reach</option>
                      <option value="Event Promotion">Live Event & Concert Promotion</option>
                      <option value="Product Launch">Product Launch & Store Opening</option>
                      <option value="Podcast Show">Podcast Season Premiere</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 8 }}>
                      Estimated Monthly Budget
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {BUDGETS.map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBudget(b)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: 10,
                            border: budget === b ? '1.5px solid #C69A2C' : '1px solid #E2E8F0',
                            background: budget === b ? '#FFFDF5' : '#FFFFFF',
                            color: budget === b ? '#C69A2C' : '#475569',
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontFamily: F,
                            transition: 'all 0.15s'
                          }}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      padding: '14px 20px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                      fontFamily: F
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStep2Submit}
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#C69A2C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(198, 154, 44, 0.25)',
                      fontFamily: F
                    }}
                  >
                    <span>{saving ? 'Creating...' : (campaignName.trim() ? 'Create & Continue' : 'Skip Step')}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3: WALLET & VIRTUAL BANK ACCOUNT ─── */}
            {step === 3 && (
              <motion.div 
                key="step3" 
                initial={{ opacity: 0, y: 12 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -12 }} 
                transition={{ duration: 0.22 }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, color: '#C69A2C', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Step 3 of 4 · Instant Wallet
                </span>
                <h2 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                  Your dedicated wallet account
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px', lineHeight: 1.5 }}>
                  We've provisioned a permanent virtual bank account for your advertiser account. Direct transfers credit your airtime balance instantly.
                </p>

                {/* Virtual Account Panel */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '24px', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFFDF5', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={18} color="#C69A2C" />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', margin: 0 }}>Wema Bank</p>
                        <span style={{ fontSize: 11, color: '#64748B' }}>Zero Transfer Fee</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: 20 }}>
                      Active
                    </span>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Account Number</span>
                      <p style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '2px 0 0', letterSpacing: '1px', fontFamily: 'monospace' }}>
                        0129384756
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyAccount('0129384756')}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        color: copiedAcct ? '#10B981' : '#C69A2C',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {copiedAcct ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedAcct ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B' }}>
                    <span>Beneficiary Name:</span>
                    <strong style={{ color: '#0F172A' }}>Studio Arella / {user?.name || 'Creator'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      padding: '14px 20px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                      fontFamily: F
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#C69A2C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(198, 154, 44, 0.25)',
                      fontFamily: F
                    }}
                  >
                    <span>Activate Account</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 4: LAUNCH CELEBRATION ─── */}
            {step === 4 && (
              <motion.div 
                key="step4" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.25 }}
                style={{ textAlign: 'center' }}
              >
                {/* Radiant Golden Circle with Checkmark (Frame 2121459612) */}
                <div style={{ 
                  width: 76, 
                  height: 76, 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle, #D4AF37 0%, #A47D1C 100%)', 
                  boxShadow: '0 0 32px rgba(212, 175, 55, 0.45)',
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: 20 
                }}>
                  <Check size={36} color="#FFFFFF" strokeWidth={3} />
                </div>

                <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block', marginBottom: 10 }}>
                  Setup Complete
                </span>

                <h2 style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
                  You're all set{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 28px', lineHeight: 1.6, maxWidth: 380, marginInline: 'auto' }}>
                  Your advertiser account is fully provisioned. Select your next action below to launch your first live broadcast.
                </p>

                {/* Direct Action Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, textAlign: 'left' }}>
                  <Link
                    href="/bookings/screen-ad"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 14,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFFDF5', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tv size={16} color="#C69A2C" />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', margin: 0 }}>Book First Screen Ad Slot</p>
                        <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>Instant screen airtime from ₦1,000/min</p>
                      </div>
                    </div>
                    <ArrowRight size={14} color="#CBD5E1" />
                  </Link>

                  <Link
                    href="/podcast/new"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 14,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mic size={16} color="#8B5CF6" />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', margin: 0 }}>Reserve Podcast Studio Session</p>
                        <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>4K multi-cam filming and acoustics</p>
                      </div>
                    </div>
                    <ArrowRight size={14} color="#CBD5E1" />
                  </Link>
                </div>

                <button
                  onClick={() => router.push('/dashboard')}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#C69A2C',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(198, 154, 44, 0.25)',
                    fontFamily: F
                  }}
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight size={15} />
                </button>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

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

    </div>
  );
}
