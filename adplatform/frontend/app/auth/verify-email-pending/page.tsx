'use client';

import { useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, RefreshCw, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { theme } from '@/lib/theme';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuthStore } from '@/store/authStore';

const F = "'Outfit', sans-serif";

function VerifyEmailPendingContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { updateUser } = useAuthStore();
  const email = params.get('email') || 'your email';
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast('Verification code resent! Please check your inbox.', 'success');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to resend. Please try again.', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (otpCode: string) => {
    setVerifying(true);
    try {
      const res = await api.post('/auth/verify-email', { code: otpCode });
      updateUser({ email_verified: true });
      toast(res.data.message || 'Email verified successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Invalid or expired verification code.', 'error');
      setVerifying(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (newCode.every(v => v !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #0a0a0a 100%)',
      fontFamily: F,
      padding: '24px',
    }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(60px)' }} />

      <div style={{
        maxWidth: 480,
        width: '100%',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '48px 40px',
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
        position: 'relative',
      }}>
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
          border: '2px solid rgba(212,175,55,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: '0 0 40px rgba(212,175,55,0.15)',
        }}>
          <Mail size={36} color={theme.color.gold} />
        </div>

        <h1 style={{ color: '#F8FAFC', fontSize: 26, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
          Enter Verification Code
        </h1>
        <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
          We've sent a 6-digit code to
        </p>
        <div style={{
          background: 'rgba(212,175,55,0.08)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 10,
          padding: '10px 16px',
          marginBottom: 32,
          color: theme.color.gold,
          fontWeight: 700,
          fontSize: 15,
          wordBreak: 'break-all',
        }}>
          {email}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={verifying}
              style={{
                width: 48,
                height: 56,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${digit ? theme.color.gold : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12,
                fontSize: 24,
                fontWeight: 800,
                color: '#fff',
                textAlign: 'center',
                outline: 'none',
                boxShadow: digit ? '0 0 10px rgba(212,175,55,0.2)' : 'none',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button
            onClick={() => handleVerify(code.join(''))}
            disabled={verifying || code.some(v => v === '')}
            style={{
              width: '100%',
              padding: '16px',
              background: (verifying || code.some(v => v === '')) ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${theme.color.gold}, #e8a825)`,
              color: (verifying || code.some(v => v === '')) ? '#64748B' : '#0a0a0a',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 800,
              cursor: (verifying || code.some(v => v === '')) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {verifying ? 'Verifying...' : 'Verify Email'}
          </button>
          
          <button
            onClick={handleResend}
            disabled={resending}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '16px',
              background: 'transparent',
              color: '#94A3B8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: resending ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        {/* Already verified */}
        <button
          onClick={() => router.push('/auth/login')}
          style={{
            background: 'none',
            border: 'none',
            color: theme.color.gold,
            fontFamily: F,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            padding: '8px',
          }}
        >
          Already verified? Sign in <ArrowRight size={14} />
        </button>

        {/* Check spam note */}
        <p style={{ color: '#475569', fontSize: 12, marginTop: 24, lineHeight: 1.6 }}>
          Can't find it? Check your <strong style={{ color: '#64748B' }}>Spam</strong> or <strong style={{ color: '#64748B' }}>Junk</strong> folder.
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function VerifyEmailPendingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>}>
      <VerifyEmailPendingContent />
    </Suspense>
  );
}
