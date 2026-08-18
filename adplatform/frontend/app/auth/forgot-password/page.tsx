'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from '@/components/ui/Animations';
import api from '@/lib/api';

const F = "'Quicksand', sans-serif";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px', background: '#FFFFFF',
    border: '1px solid #CBD5E1', borderRadius: 4, fontSize: 13,
    fontFamily: F, color: '#0F172A', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s', fontWeight: 500
  };
  const onFocus = (e: any) => { 
    e.target.style.borderColor = '#D4AF37'; 
    e.target.style.boxShadow = '0 0 0 2px rgba(212,175,55,0.1)'; 
  };
  const onBlur  = (e: any) => { 
    e.target.style.borderColor = '#CBD5E1'; 
    e.target.style.boxShadow = 'none'; 
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block',
    marginBottom: 6,
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast('Please enter your email', 'error'); return; }
    
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      toast('Verification code sent to your email', 'success');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP Entry
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newCode = [...otpCode];
    newCode[index] = value;
    setOtpCode(newCode);

    if (value && index < 3) inputRefs.current[index + 1]?.focus();
    // In Figma, there's a continue button, so we don't auto-submit.
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 4);
    if (!pastedData) return;
    const newCode = [...otpCode];
    for (let i = 0; i < pastedData.length; i++) newCode[i] = pastedData[i];
    setOtpCode(newCode);
    const focusIndex = pastedData.length < 4 ? pastedData.length : 3;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast('Verification code resent!', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to resend.', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode.some(v => v === '')) {
      toast('Please enter the full 4-digit code', 'error');
      return;
    }
    setStep(3);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    if (password !== confirmPassword) { toast('Passwords do not match', 'error'); return; }
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code: otpCode.join(''), password });
      toast('Password changed successfully!', 'success');
      router.push('/auth/login');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Invalid or expired code.', 'error');
      // If code is invalid, let them go back to step 2 or resend
      if (err?.response?.status === 400) setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex" style={{ fontFamily: F, minHeight: '100vh', background: '#FFFFFF' }}>
      
      {/* ── Left panel (Image + Overlay) ── */}
      <div className="hidden lg:flex flex-col justify-center" style={{ flex: '1 1 50%', maxWidth: '50%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("/signup-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#705F1C', opacity: 0.85, mixBlendMode: 'multiply', zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(92, 77, 21, 0.7)', zIndex: 2 }} />

        <div style={{ position: 'relative', zIndex: 3, padding: '0 10%', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          
          <div style={{ position: 'absolute', top: 60, left: '10%' }}>
            <Link href="/">
              <img src="/logo-white.png" alt="Studio Arella Logo" style={{ height: 60, objectFit: 'contain' }} />
            </Link>
          </div>

          <div style={{ color: '#D4AF37', fontSize: 60, fontFamily: 'serif', fontWeight: 900, lineHeight: 0.5, marginBottom: 24, marginTop: 40 }}>“</div>
          
          <div style={{ position: 'relative', display: 'inline-block', alignSelf: 'flex-start' }}>
            <h2 style={{ fontSize: 24, fontWeight: 500, color: '#FFFFFF', margin: '0', lineHeight: 1.5, maxWidth: 360 }}>
              Welcome back! Start creating your podcasts, music, and ads in real time.
            </h2>
            
            {/* The white angle accent */}
            <div style={{ position: 'absolute', bottom: -20, right: -40, width: 20, height: 20, borderBottom: '5px solid #FFFFFF', borderRight: '5px solid #FFFFFF' }} />
          </div>
          
          {/* Faint dotted accent top right */}
          <div style={{ position: 'absolute', top: 180, right: 60, width: 60, height: 60, backgroundImage: 'radial-gradient(circle, rgba(212,175,55,0.4) 2px, transparent 2px)', backgroundSize: '12px 12px' }} />

        </div>
      </div>

      {/* ── Right panel (Dynamic Form) ── */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-16" style={{ flex: '1 1 50%', maxWidth: '100%', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ position: 'absolute', top: 40, right: 40, textAlign: 'right' }}>
           <Link href="/auth/login" style={{ fontSize: 13, color: '#64748B', fontWeight: 700, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
             <span style={{ fontSize: 11, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Go to</span>
             Log in
           </Link>
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: Email Input */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full max-w-[420px]">
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Forgot password</h1>
              <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 32px', fontWeight: 500 }}>
                Enter your email and a verification code will be sent to you
              </p>

              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Work email address*</label>
                  <input type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <AnimatedButton
                  type="submit"
                  loading={loading}
                  loadingText="Sending..."
                  style={{ width: '100%', padding: '14px', background: '#D4AF37', color: '#0F172A', borderRadius: 6, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(212,175,55,0.2)' }}
                >
                  Continue
                </AnimatedButton>
              </form>
            </motion.div>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full max-w-[420px]">
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Enter code</h1>
              <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 32px', fontWeight: 500 }}>
                We sent a four digit code to your work email.
              </p>

              <div style={{ textAlign: 'left', marginBottom: 8 }}>
                <label style={labelStyle}>Enter code*</label>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
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
                    style={{
                      flex: 1, height: 56, background: '#FFFFFF',
                      border: `1px solid ${digit || index === 0 ? '#D4AF37' : '#CBD5E1'}`,
                      borderRadius: 8, fontSize: 20, fontWeight: 700, color: '#0F172A',
                      textAlign: 'center', outline: 'none',
                      boxShadow: digit || index === 0 ? '0 0 0 2px rgba(212,175,55,0.1)' : 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 2px rgba(212,175,55,0.1)'; }}
                    onBlur={(e) => { if(!digit && index !== 0) { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; } }}
                  />
                ))}
              </div>

              <div style={{ textAlign: 'right', marginBottom: 32 }}>
                <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
                  Didn't get code?{' '}
                  <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', color: '#D4AF37', fontWeight: 600, cursor: resending ? 'wait' : 'pointer', padding: 0 }}>
                    {resending ? 'Sending...' : 'Resend'}
                  </button>
                </span>
              </div>

              <AnimatedButton
                onClick={handleVerifyOtp}
                disabled={otpCode.some(v => v === '')}
                style={{ width: '100%', padding: '14px', background: '#D4AF37', color: '#0F172A', borderRadius: 6, fontSize: 15, fontWeight: 700, border: 'none', cursor: (otpCode.some(v => v === '')) ? 'not-allowed' : 'pointer', opacity: (otpCode.some(v => v === '')) ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(212,175,55,0.2)' }}
              >
                Continue
              </AnimatedButton>
            </motion.div>
          )}

          {/* STEP 3: Change Password */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full max-w-[420px]">
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Change password</h1>
              <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 32px', fontWeight: 500 }}>
                Enter a new password and proceed to Log in
              </p>

              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                <div>
                  <label style={labelStyle}>New password*</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} placeholder="123 Arella"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required style={{ ...inputStyle, paddingRight: 60 }} onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A', fontWeight: 600, fontSize: 11 }}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Password*</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirmPw ? 'text' : 'password'} placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required style={{ ...inputStyle, paddingRight: 60 }} onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowConfirmPw(p => !p)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A', fontWeight: 600, fontSize: 11 }}>
                      {showConfirmPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <AnimatedButton
                  type="submit"
                  loading={loading}
                  loadingText="Resetting..."
                  style={{ width: '100%', padding: '14px', background: '#D4AF37', color: '#0F172A', borderRadius: 6, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(212,175,55,0.2)', marginTop: 8 }}
                >
                  Proceed to login
                </AnimatedButton>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
