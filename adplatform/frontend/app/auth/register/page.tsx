'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import { FaCheck } from 'react-icons/fa6';
import GoogleButton from '@/components/ui/GoogleButton';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from '@/components/ui/Animations';
import api from '@/lib/api';

const F = "'Quicksand', sans-serif";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['#EF4444', '#D4AF37', '#22c55e'];
  const labels = ['Weak', 'Fair', 'Strong'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < score ? colors[score - 1] : 'rgba(0,0,0,0.05)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: score > 0 ? colors[score - 1] : '#94A3B8' }}>{score > 0 ? labels[score - 1] : ''}</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {checks.map(c => (
            <span key={c.label} style={{ fontSize: 10, color: c.pass ? '#22c55e' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.pass ? '#22c55e' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.pass && <FaCheck size={6} color="#fff" />}
              </div>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: '',
    business_name: '', phone: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const { register, isLoading, updateUser } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px', background: '#FFFFFF',
    border: '1px solid #CBD5E1', borderRadius: 4, fontSize: 13,
    fontFamily: F, color: '#0F172A', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s', fontWeight: 500
  };
  const onFocus = (e: any) => { e.target.style.borderColor = '#D4AF37'; };
  const onBlur  = (e: any) => { e.target.style.borderColor = '#CBD5E1'; };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 500, color: '#64748B', display: 'block',
    marginBottom: 6,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim())    { toast('Please enter your first name', 'error'); return; }
    if (!form.last_name.trim())     { toast('Please enter your last name', 'error'); return; }
    if (!form.email.trim())         { toast('Please enter your email', 'error'); return; }
    if (form.password.length < 6)   { toast('Password must be at least 6 characters', 'error'); return; }
    if (form.password !== form.confirm_password) { toast('Passwords do not match', 'error'); return; }
    try {
      await register(form.first_name, form.last_name, form.email, form.password, form.business_name || undefined, form.phone || undefined);
      setShowOtpModal(true);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      console.error('Registration error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      toast(msg, 'error');
    }
  };

  // OTP Logic
  const handleVerify = async (codeStr: string) => {
    setVerifying(true);
    try {
      const res = await api.post('/auth/verify-email', { code: codeStr });
      updateUser({ email_verified: true });
      toast(res.data.message || 'Email verified successfully!', 'success');
      setShowOtpModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Invalid or expired verification code.', 'error');
      setVerifying(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newCode = [...otpCode];
    newCode[index] = value;
    setOtpCode(newCode);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newCode.every(v => v !== '')) handleVerify(newCode.join(''));
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const newCode = [...otpCode];
    for (let i = 0; i < pastedData.length; i++) newCode[i] = pastedData[i];
    setOtpCode(newCode);
    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex]?.focus();
    if (newCode.every(v => v !== '')) handleVerify(newCode.join(''));
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: form.email, method: 'email' });
      toast('Verification code sent via Email!', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to send. Please try again.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex" style={{ fontFamily: F, minHeight: '100vh', background: '#FFFFFF', position: 'relative' }}>
      
      {/* ── Left panel (Image + Overlay) ── */}
      <div className="hidden lg:flex flex-col justify-center" style={{ flex: '1 1 50%', maxWidth: '50%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("/signup-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#705F1C', opacity: 0.85, mixBlendMode: 'multiply', zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(92, 77, 21, 0.7)', zIndex: 2 }} />

        <div style={{ position: 'relative', zIndex: 3, padding: '0 10%', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: 60, left: '10%' }}>
            <Link href="/"><img src="/logo-white.png" alt="Studio Arella Logo" style={{ height: 60, objectFit: 'contain' }} /></Link>
          </div>
          <div style={{ color: '#D4AF37', fontSize: 60, fontFamily: 'serif', fontWeight: 900, lineHeight: 0.5, marginBottom: 24, marginTop: 40 }}>“</div>
          <h2 style={{ fontSize: 24, fontWeight: 500, color: '#FFFFFF', margin: '0 0 60px', lineHeight: 1.5, maxWidth: 440 }}>
            Podcasts, music, and ads made to be heard, felt, and remembered.
          </h2>
          <div style={{ position: 'relative' }}>
             <div style={{ position: 'absolute', top: -30, right: 0, width: 20, height: 20, borderBottom: '5px solid #FFFFFF', borderLeft: '5px solid #FFFFFF' }} />
             <div style={{ position: 'absolute', top: -140, right: 40, width: 60, height: 60, backgroundImage: 'radial-gradient(circle, rgba(212,175,55,0.4) 2px, transparent 2px)', backgroundSize: '12px 12px' }} />
             <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <li style={{ fontSize: 15, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 12 }}><span style={{ fontSize: 24, lineHeight: 0.8 }}>•</span><span><strong style={{ fontWeight: 600 }}>Give a Voice. Make Impact.</strong> — Podcasting, music & advertising, all under one roof.</span></li>
                <li style={{ fontSize: 15, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 12 }}><span style={{ fontSize: 24, lineHeight: 0.8 }}>•</span><span><strong style={{ fontWeight: 600 }}>Your Sound. Your Story. Your Stage.</strong> — Create, record, and get heard.</span></li>
                <li style={{ fontSize: 15, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 12 }}><span style={{ fontSize: 24, lineHeight: 0.8 }}>•</span><span><strong style={{ fontWeight: 600 }}>From Studio to Spotlight.</strong> — We create sounds and put them where audiences are listening.</span></li>
             </ul>
          </div>
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -10, left: -10, width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
      </div>

      {/* ── Right panel (Form) ── */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-16" style={{ flex: '1 1 50%', maxWidth: '100%', position: 'relative' }}>
        
        <div style={{ position: 'absolute', top: 40, right: 40, textAlign: 'right' }}>
           <p style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>YOUR</p>
           <p style={{ fontSize: 13, color: '#64748B', fontWeight: 700, margin: 0 }}>Personal Info.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="w-full max-w-[440px]">

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Create Your Account!</h1>
          <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 32px', fontWeight: 500 }}>
            Getting started is easy. Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>

          <GoogleButton label="Sign up with Google" 
             style={{ background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', fontWeight: 600 }} 
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>Or continue with</span>
            <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>First name*</label>
                <input type="text" placeholder="Invictus" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required autoFocus style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={labelStyle}>Last name*</label>
                <input type="text" placeholder="Innocent" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email address*</label>
              <input type="email" placeholder="Enter your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label style={labelStyle}>Business name <span style={{fontWeight:400, color:'#94A3B8'}}>(optional)</span></label>
                  <input type="text" placeholder="Brand name" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
               </div>
               <div>
                  <label style={labelStyle}>Phone <span style={{fontWeight:400, color:'#94A3B8'}}>(optional)</span></label>
                  <input type="tel" placeholder="08012345678" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
               </div>
            </div>
            <div>
              <label style={labelStyle}>Password*</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} placeholder="Enter password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ ...inputStyle, paddingRight: 60 }} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A', fontWeight: 600, fontSize: 11 }}>{showPw ? 'Hide' : 'Show'}</button>
              </div>
              <PasswordStrength password={form.password} />
            </div>
            <div>
              <label style={labelStyle}>Confirm password*</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirmPw ? 'text' : 'password'} placeholder="Confirm password" value={form.confirm_password} onChange={e => setForm({ ...form, confirm_password: e.target.value })} required style={{ ...inputStyle, paddingRight: 60 }} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShowConfirmPw(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A', fontWeight: 600, fontSize: 11 }}>{showConfirmPw ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12, marginBottom: 8 }}>
              <input type="checkbox" id="terms" required style={{ marginTop: 2, accentColor: '#D4AF37', cursor: 'pointer', width: 16, height: 16, borderRadius: 4, border: '1px solid #CBD5E1' }} />
              <label htmlFor="terms" style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, cursor: 'pointer', fontWeight: 500 }}>
                I agree to terms & conditions. Read terms & conditions <Link href="/terms" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 500 }}>here</Link>
              </label>
            </div>
            <AnimatedButton type="submit" loading={isLoading} loadingText="Creating account" style={{ width: '100%', padding: '14px', background: '#D4AF37', color: '#0F172A', borderRadius: 6, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(212,175,55,0.2)' }}>
              Register Account
            </AnimatedButton>
          </form>
        </motion.div>
      </div>

      {/* ── Modals Overlay ── */}
      <AnimatePresence>
        {(showOtpModal || showSuccessModal) && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Blurred Background Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}
            />
            
            {/* Modal Content */}
            <motion.div
              key={showSuccessModal ? 'success' : 'otp'}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ position: 'relative', background: '#FFFFFF', borderRadius: 16, padding: '40px', width: '100%', maxWidth: 460, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', textAlign: 'center' }}
            >
              {showSuccessModal ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaCheck size={32} color="#FFFFFF" />
                    </div>
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 32px' }}>
                    Account created successfully
                  </h2>
                  <AnimatedButton
                    onClick={() => router.push('/onboarding')}
                    style={{ width: '100%', padding: '14px', background: '#D4AF37', color: '#0F172A', borderRadius: 6, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Continue to home
                  </AnimatedButton>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 32px' }}>
                    We sent you a code. Check your work email
                  </h2>

                  <div style={{ textAlign: 'left', marginBottom: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Enter code*</label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => { inputRefs.current[index] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        placeholder={index === 0 ? '1' : ''}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        disabled={verifying}
                        style={{
                          width: '100%', height: 56, background: '#FFFFFF',
                          border: `1px solid ${digit || index === 0 ? '#D4AF37' : '#E2E8F0'}`,
                          borderRadius: 8, fontSize: 20, fontWeight: 700, color: '#0F172A',
                          textAlign: 'center', outline: 'none',
                          boxShadow: digit || index === 0 ? '0 0 0 2px rgba(212,175,55,0.1)' : 'none',
                          transition: 'all 0.2s',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 2px rgba(212,175,55,0.1)'; }}
                        onBlur={(e) => { if(!digit && index !== 0) { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; } }}
                      />
                    ))}
                  </div>

                  <div style={{ textAlign: 'right', marginBottom: 24 }}>
                    <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
                      Didn't get code?{' '}
                      <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', color: '#D4AF37', fontWeight: 600, cursor: resending ? 'wait' : 'pointer', padding: 0 }}>
                        {resending ? 'Sending...' : 'Resend'}
                      </button>
                    </span>
                  </div>

                  <p style={{ fontSize: 14, color: '#475569', fontWeight: 500, margin: '0 0 32px', lineHeight: 1.5 }}>
                    Enter the verification code sent to your work email
                  </p>

                  <AnimatedButton
                    onClick={() => handleVerify(otpCode.join(''))}
                    disabled={verifying || otpCode.some(v => v === '')}
                    loading={verifying}
                    loadingText="Verifying..."
                    style={{ width: '100%', padding: '14px', background: '#D4AF37', color: '#0F172A', borderRadius: 6, fontSize: 15, fontWeight: 700, border: 'none', cursor: (verifying || otpCode.some(v => v === '')) ? 'not-allowed' : 'pointer', opacity: (verifying || otpCode.some(v => v === '')) ? 0.7 : 1, transition: 'all 0.2s' }}
                  >
                    Continue
                  </AnimatedButton>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
            -webkit-text-fill-color: #0F172A !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
