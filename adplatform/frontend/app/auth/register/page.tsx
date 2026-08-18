'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import { FaCheck } from 'react-icons/fa6';
import GoogleButton from '@/components/ui/GoogleButton';
import { motion } from 'framer-motion';
import { AnimatedButton } from '@/components/ui/Animations';

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
  const { register, isLoading } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

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
      router.push(`/auth/verify-email-pending?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      console.error('Registration error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      toast(msg, 'error');
    }
  };

  return (
    <div className="flex" style={{ fontFamily: F, minHeight: '100vh', background: '#FFFFFF' }}>
      
      {/* ── Left panel (Image + Overlay) ── */}
      <div className="hidden lg:flex flex-col justify-center" style={{ flex: '1 1 50%', maxWidth: '50%', position: 'relative', overflow: 'hidden' }}>
        {/* Background Image with Color Blend */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
        {/* The heavy olive/gold tint */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#705F1C', opacity: 0.85, mixBlendMode: 'multiply', zIndex: 1 }} />
        {/* A secondary flat color to guarantee the dark gold look if image fails */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(92, 77, 21, 0.7)', zIndex: 2 }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 3, padding: '0 10%', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          
          <div style={{ position: 'absolute', top: 60, left: '10%' }}>
            <Link href="/">
              <img src="/logo-white.png" alt="Studio Arella Logo" style={{ height: 60, objectFit: 'contain' }} />
            </Link>
          </div>

          <div style={{ color: '#D4AF37', fontSize: 60, fontFamily: 'serif', fontWeight: 900, lineHeight: 0.5, marginBottom: 24, marginTop: 40 }}>“</div>
          
          <h2 style={{ fontSize: 24, fontWeight: 500, color: '#FFFFFF', margin: '0 0 60px', lineHeight: 1.5, maxWidth: 440 }}>
            Podcasts, music, and ads made to be heard, felt, and remembered.
          </h2>

          <div style={{ position: 'relative' }}>
             {/* The white angle accent from the design */}
             <div style={{ position: 'absolute', top: -30, right: 0, width: 20, height: 20, borderBottom: '5px solid #FFFFFF', borderLeft: '5px solid #FFFFFF' }} />
             {/* The dotted square accent */}
             <div style={{ position: 'absolute', top: -140, right: 40, width: 60, height: 60, backgroundImage: 'radial-gradient(circle, rgba(212,175,55,0.4) 2px, transparent 2px)', backgroundSize: '12px 12px' }} />

             <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <li style={{ fontSize: 15, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 24, lineHeight: 0.8 }}>•</span>
                  <span><strong style={{ fontWeight: 600 }}>Give a Voice. Make Impact.</strong> — Podcasting, music & advertising, all under one roof.</span>
                </li>
                <li style={{ fontSize: 15, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 24, lineHeight: 0.8 }}>•</span>
                  <span><strong style={{ fontWeight: 600 }}>Your Sound. Your Story. Your Stage.</strong> — Create, record, and get heard.</span>
                </li>
                <li style={{ fontSize: 15, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 24, lineHeight: 0.8 }}>•</span>
                  <span><strong style={{ fontWeight: 600 }}>From Studio to Spotlight.</strong> — We create sounds and put them where audiences are listening.</span>
                </li>
             </ul>
          </div>
          
          {/* Faint circles bottom left */}
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
                <input type="text" placeholder="Invictus"
                  value={form.first_name}
                  onChange={e => setForm({ ...form, first_name: e.target.value })}
                  required autoFocus style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={labelStyle}>Last name*</label>
                <input type="text" placeholder="Innocent"
                  value={form.last_name}
                  onChange={e => setForm({ ...form, last_name: e.target.value })}
                  required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email address*</label>
              <input type="email" placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label style={labelStyle}>Business name <span style={{fontWeight:400, color:'#94A3B8'}}>(optional)</span></label>
                  <input type="text" placeholder="Brand name"
                     value={form.business_name}
                     onChange={e => setForm({ ...form, business_name: e.target.value })}
                     style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
               </div>
               <div>
                  <label style={labelStyle}>Phone <span style={{fontWeight:400, color:'#94A3B8'}}>(optional)</span></label>
                  <input type="tel" placeholder="08012345678"
                     value={form.phone}
                     onChange={e => setForm({ ...form, phone: e.target.value })}
                     style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
               </div>
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
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label style={labelStyle}>Confirm password*</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirmPw ? 'text' : 'password'} placeholder="Confirm password"
                  value={form.confirm_password}
                  onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                  required style={{ ...inputStyle, paddingRight: 60 }} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShowConfirmPw(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A', fontWeight: 600, fontSize: 11 }}>
                  {showConfirmPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12, marginBottom: 8 }}>
              <input type="checkbox" id="terms" required style={{ marginTop: 2, accentColor: '#D4AF37', cursor: 'pointer', width: 16, height: 16, borderRadius: 4, border: '1px solid #CBD5E1' }} />
              <label htmlFor="terms" style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, cursor: 'pointer', fontWeight: 500 }}>
                I agree to terms & conditions. Read terms & conditions <Link href="/terms" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 500 }}>here</Link>
              </label>
            </div>

            <AnimatedButton
              type="submit"
              loading={isLoading}
              loadingText="Creating account"
              style={{ width: '100%', padding: '14px', background: '#D4AF37', color: '#0F172A', borderRadius: 6, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(212,175,55,0.2)' }}
            >
              Register Account
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
