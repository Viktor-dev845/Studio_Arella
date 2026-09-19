'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import GoogleButton from '@/components/ui/GoogleButton';
import { motion } from 'framer-motion';
import { AnimatedButton } from '@/components/ui/Animations';
import { theme } from '@/lib/theme';

const F = "'Quicksand', sans-serif";

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const { login, completeTwoFactorLogin } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 64, padding: '0 24px', background: '#FFFFFF',
    border: '1px solid #8692A6', borderRadius: 6, fontSize: 14,
    fontFamily: 'inherit', color: '#494949', outline: 'none', boxSizing: 'border-box',
    transition: 'all 0.2s', fontWeight: 400
  };
  const onFocus = (e: any) => { 
    e.target.style.borderColor = '#D4AF37'; 
    e.target.style.boxShadow = '0px 4px 10px 3px rgba(0, 0, 0, 0.11)';
  };
  const onBlur  = (e: any) => { 
    e.target.style.borderColor = '#8692A6'; 
    e.target.style.boxShadow = 'none';
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 16, fontWeight: 400, color: '#696F79', display: 'block',
    marginBottom: 8,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim()) { toast('Please enter your email', 'error'); return; }
    if (!form.password) { toast('Please enter your password', 'error'); return; }
    
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if ('requires_2fa' in result && result.requires_2fa) {
        setPendingToken(result.pending_token);
        setLoading(false);
        return;
      }
      router.push((result as any)?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Incorrect email or password', 'error');
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length !== 6 || !pendingToken) { toast('Enter the 6-digit code from your authenticator app', 'error'); return; }
    setLoading(true);
    try {
      const user = await completeTwoFactorLogin(pendingToken, twoFactorCode);
      router.push((user as any)?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Incorrect code. Please try again.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="flex" style={{ fontFamily: F, minHeight: '100vh', background: theme.color.surface }}>
      
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
            
            {/* The white angle accent from the design, positioned bottom right of the text block */}
            <div style={{ position: 'absolute', bottom: -20, right: -40, width: 20, height: 20, borderBottom: '5px solid #FFFFFF', borderRight: '5px solid #FFFFFF' }} />
          </div>
          
          {/* Faint dotted accent top right */}
          <div style={{ position: 'absolute', top: 180, right: 60, width: 60, height: 60, backgroundImage: 'radial-gradient(circle, rgba(212,175,55,0.4) 2px, transparent 2px)', backgroundSize: '12px 12px' }} />

        </div>
      </div>

      {/* ── Right panel (Form) ── */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-16" style={{ flex: '1 1 50%', maxWidth: '100%', position: 'relative' }}>
        
        <div style={{ position: 'absolute', top: 40, right: 40, textAlign: 'right' }}>
           <p style={{ fontSize: 14, color: '#BDBDBD', fontWeight: 400, margin: 0 }}>YOUR</p>
           <p style={{ fontSize: 16, color: '#8692A6', fontWeight: 600, margin: 0 }}>Login details</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="w-full max-w-[426px]">

          {pendingToken ? (
            <>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: theme.color.text1, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Two-factor code</h1>
              <p style={{ fontSize: 15, color: theme.color.text3, margin: '0 0 32px', fontWeight: 500 }}>
                Enter the 6-digit code from your authenticator app.
              </p>
              <form onSubmit={handleVerify2FA} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  autoFocus
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  style={{ ...inputStyle, fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
                  onFocus={onFocus} onBlur={onBlur}
                />
                <AnimatedButton
                  type="submit"
                  loading={loading}
                  loadingText="Verifying..."
                  style={{ width: '100%', padding: '14px', background: '#D4AF37', color: '#0F172A', borderRadius: 6, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(212,175,55,0.2)' }}
                >
                  Verify & Log in
                </AnimatedButton>
                <button type="button" onClick={() => { setPendingToken(null); setTwoFactorCode(''); }}
                  style={{ background: 'none', border: 'none', color: theme.color.text3, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
                  Back to login
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 30, fontWeight: 700, color: '#000000', margin: '0 0 8px' }}>Log in</h1>
              <p style={{ fontSize: 18, color: '#8692A6', margin: '0 0 32px', fontWeight: 400 }}>
                Don't have an account?{' '}
                <Link href="/auth/register" style={{ color: '#D4AF37', fontWeight: 400, textDecoration: 'none' }}>Sign up</Link>
              </p>

              <GoogleButton label="Google" 
                 style={{ background: '#FFFFFF', color: '#000000', border: '1px solid #D4AF37', borderRadius: 5, fontWeight: 500, height: 44, width: 126, margin: '0 auto', display: 'flex', justifyContent: 'center' }} 
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0 24px' }}>
                <div style={{ flex: 1, height: 1, background: '#DBDBDB' }} />
                <span style={{ fontSize: 13, color: '#121212', fontWeight: 400 }}>Or continue with</span>
                <div style={{ flex: 1, height: 1, background: '#DBDBDB' }} />
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                <div>
                  <label style={labelStyle}>Email address*</label>
                  <input type="email" placeholder="Invictus@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <div>
                  <label style={labelStyle}>Password*</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} placeholder="Enter password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required style={{ ...inputStyle, paddingRight: 60 }} onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#000000', fontWeight: 400, fontSize: 12 }}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: 12 }}>
                     <Link href="/auth/forgot-password" style={{ fontSize: 12, color: '#D4AF37', fontWeight: 400, textDecoration: 'none' }}>Forgot password?</Link>
                  </div>
                </div>

                <AnimatedButton
                  type="submit"
                  loading={loading}
                  loadingText="Logging in..."
                  style={{ width: '100%', height: 64, background: '#D4AF37', color: '#121212', borderRadius: 6, fontSize: 16, fontWeight: 300, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}
                >
                  Login
                </AnimatedButton>
              </form>
            </>
          )}
        </motion.div>
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
