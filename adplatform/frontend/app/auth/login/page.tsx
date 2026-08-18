'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import GoogleButton from '@/components/ui/GoogleButton';
import { motion } from 'framer-motion';
import { AnimatedButton } from '@/components/ui/Animations';

const F = "'Quicksand', sans-serif";

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim()) { toast('Please enter your email', 'error'); return; }
    if (!form.password) { toast('Please enter your password', 'error'); return; }
    
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.push((user as any)?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Incorrect email or password', 'error');
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
           <p style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>YOUR</p>
           <p style={{ fontSize: 13, color: '#64748B', fontWeight: 700, margin: 0 }}>Login details</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="w-full max-w-[420px]">

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Log in</h1>
          <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 32px', fontWeight: 500 }}>
            Don't have an account?{' '}
            <Link href="/auth/register" style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </p>

          <GoogleButton label="Log in with Google" 
             style={{ background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', fontWeight: 600 }} 
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>Or continue with</span>
            <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div>
              <label style={labelStyle}>Email address*</label>
              <input type="email" placeholder="you@example.com"
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
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A', fontWeight: 600, fontSize: 11 }}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                 <Link href="/auth/forgot-password" style={{ fontSize: 12, color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
              </div>
            </div>

            <AnimatedButton
              type="submit"
              loading={loading}
              loadingText="Logging in..."
              style={{ width: '100%', padding: '14px', background: '#D4AF37', color: '#0F172A', borderRadius: 6, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(212,175,55,0.2)', marginTop: 8 }}
            >
              Log in
            </AnimatedButton>
          </form>
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
