'use client';

import { useState } from 'react';
import { ArrowLeft, X, Search, Lock, Link2, Check } from 'lucide-react';
import { theme } from '@/lib/theme';

const F = theme.font.body;

// This entire flow is a front-end prototype of the "link a bank" UX only.
// No real account-aggregation provider (Bemspay or otherwise) is wired up —
// nothing typed into the User ID/Password or NIN fields below is ever sent
// anywhere, and no bank account is actually linked. See the summary given to
// the user for why: those fields would otherwise collect a real online
// banking password, which this app must never transmit or store.

type Step = 'consent' | 'verification' | 'bank-list' | 'app-select' | 'login' | 'account-select' | 'capture' | 'success';

interface Bank {
  id: string;
  name: string;
  color: string;
  apps?: string[];
}

const BANKS: Bank[] = [
  { id: 'gtbank', name: 'GTBank', color: '#EA5B0C', apps: ['GTWorld', 'GTBank'] },
  { id: 'access', name: 'Access Bank', color: '#F97316' },
  { id: 'firstbank', name: 'First Bank', color: '#1B2A4A' },
  { id: 'fcmb', name: 'FCMB', color: '#5B2A86' },
  { id: 'kuda', name: 'Kuda Bank', color: '#3D1A78' },
  { id: 'opay', name: 'OPay', color: '#0AAE5E' },
];

const DEMO_ACCOUNTS = [
  { id: 'usd', name: 'David Adebola', label: 'Dollar account', masked: '****5464', currency: 'USD', balance: '15,005.25' },
  { id: 'ngn', name: 'David Adebola', label: 'Naira account', masked: '****5484', currency: '₦', balance: '5,215,005.25' },
];

function BankLogo({ bank, size = 32 }: { bank: Bank; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bank.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 800, flexShrink: 0 }}>
      {bank.name[0]}
    </div>
  );
}

export default function LinkBankModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('consent');
  const [country, setCountry] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('NIN');
  const [nin, setNin] = useState('');
  const [search, setSearch] = useState('');
  const [accountType, setAccountType] = useState<'individual' | 'business'>('individual');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const filteredBanks = BANKS.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  const back = () => {
    if (step === 'verification') setStep('consent');
    else if (step === 'bank-list') setStep('verification');
    else if (step === 'app-select') setStep('bank-list');
    else if (step === 'login') setStep(selectedBank?.apps ? 'app-select' : 'bank-list');
    else if (step === 'account-select') setStep('login');
    else if (step === 'capture') setStep('account-select');
  };

  const pickBank = (bank: Bank) => {
    setSelectedBank(bank);
    setStep(bank.apps ? 'app-select' : 'login');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380, background: theme.color.surface, borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', fontFamily: F, overflow: 'hidden' }}>
        {step !== 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: `1px solid ${theme.color.border}` }}>
            {step !== 'consent' ? (
              <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, display: 'flex' }}><ArrowLeft size={18} /></button>
            ) : <span style={{ width: 18 }} />}
            <span style={{ fontSize: 14.5, fontWeight: 800, color: theme.color.text1 }}>
              {step === 'consent' && ''}
              {step === 'verification' && 'Verification'}
              {(step === 'bank-list' || step === 'app-select') && 'Choose your bank'}
              {step === 'login' && 'Login'}
              {step === 'account-select' && 'Login'}
              {step === 'capture' && ''}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, display: 'flex' }}><X size={18} /></button>
          </div>
        )}

        <div style={{ padding: step === 'bank-list' || step === 'app-select' ? '16px 18px' : '22px 20px' }}>
          {step === 'consent' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: theme.color.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link2 size={18} color={theme.color.charcoal900} />
                </div>
              </div>
              <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 20px' }}>
                This application uses <strong style={{ color: theme.color.text1 }}>Bemspay</strong> to connect your accounts
              </p>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 22 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link2 size={18} color={theme.color.gold} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: theme.color.text1 }}>Connect effortlessly</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.color.text3 }}>Bemspay lets you connect your financial account in seconds.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Lock size={18} color={theme.color.gold} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: theme.color.text1 }}>Private</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.color.text3 }}>Bemspay does not sell personal info, and will only use it with your permission.</p>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 11, color: theme.color.text4, margin: '0 0 18px' }}>
                By clicking on the button below you agree to Bemspay&apos;s <span style={{ color: theme.color.gold, fontWeight: 700 }}>Terms and Conditions</span>
              </p>
              <button onClick={() => setStep('verification')} style={{ width: '100%', padding: 13, background: theme.color.gold, border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 800, color: theme.color.charcoal900, cursor: 'pointer' }}>
                Click to continue
              </button>
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, color: theme.color.text4, marginTop: 14 }}>
                <Lock size={11} /> Secured with Bemspay
              </p>
            </div>
          )}

          {step === 'verification' && (
            <>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>Country of residence</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: `1px solid ${theme.color.border}`, background: theme.color.surface, color: theme.color.text1, fontSize: 13, fontFamily: F }}>
                  <option value="">— Select —</option>
                  <option value="NG">Nigeria</option>
                  <option value="GH">Ghana</option>
                  <option value="KE">Kenya</option>
                </select>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>Verification method</label>
                <select value={verificationMethod} onChange={(e) => setVerificationMethod(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: `1px solid ${theme.color.border}`, background: theme.color.surface, color: theme.color.text1, fontSize: 13, fontFamily: F }}>
                  <option value="NIN">NIN</option>
                  <option value="BVN">BVN</option>
                </select>
              </div>
              <input
                placeholder={`Enter your ${verificationMethod}`}
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${theme.color.border}`, background: theme.color.surface, color: theme.color.text1, fontSize: 13, fontFamily: F, marginBottom: 20 }}
              />
              <button onClick={() => setStep('bank-list')} style={{ width: '100%', padding: 13, background: theme.color.gold, border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 800, color: theme.color.charcoal900, cursor: 'pointer' }}>
                Click to continue
              </button>
            </>
          )}

          {step === 'bank-list' && (
            <>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <Search size={15} color={theme.color.text4} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  placeholder="Search for your bank"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 10, border: `1px solid ${theme.color.border}`, background: theme.color.surface, color: theme.color.text1, fontSize: 13, fontFamily: F }}
                />
              </div>
              <div style={{ display: 'flex', borderRadius: 10, background: theme.color.surface2, padding: 3, marginBottom: 16 }}>
                {(['individual', 'business'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAccountType(t)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                      background: accountType === t ? theme.color.gold : 'transparent',
                      color: accountType === t ? theme.color.charcoal900 : theme.color.text3,
                    }}
                  >
                    {t === 'individual' ? 'Individual account' : 'Business account'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 260, overflowY: 'auto' }}>
                {filteredBanks.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => pickBank(b)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 4px', borderBottom: `1px solid ${theme.color.border}`, cursor: 'pointer' }}
                  >
                    <BankLogo bank={b} size={28} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.color.text1 }}>{b.name}</span>
                  </div>
                ))}
                {filteredBanks.length === 0 && <p style={{ textAlign: 'center', color: theme.color.text3, fontSize: 12.5, padding: '20px 0' }}>No banks match your search.</p>}
              </div>
            </>
          )}

          {step === 'app-select' && selectedBank && (
            <>
              <p style={{ fontSize: 13, fontWeight: 800, color: theme.color.text1, margin: '0 0 4px' }}>Select an app</p>
              <p style={{ fontSize: 12, color: theme.color.text3, margin: '0 0 16px' }}>This bank has multiple apps. Which of them do you want to use?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedBank.apps!.map((app) => (
                  <div
                    key={app}
                    onClick={() => { setSelectedApp(app); setStep('login'); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: `1px solid ${theme.color.border}`, cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <BankLogo bank={selectedBank} size={26} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: theme.color.text1 }}>{app}</span>
                    </div>
                    <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} color={theme.color.text4} />
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 'login' && selectedBank && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <BankLogo bank={selectedBank} size={44} />
              </div>
              <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 20px' }}>Please login to your account</p>
              <div style={{ textAlign: 'left', marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>User ID</label>
                <input
                  placeholder="Enter your user ID / account number"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${theme.color.border}`, background: theme.color.surface, color: theme.color.text1, fontSize: 13, fontFamily: F }}
                />
              </div>
              <div style={{ textAlign: 'left', marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${theme.color.border}`, background: theme.color.surface, color: theme.color.text1, fontSize: 13, fontFamily: F }}
                />
              </div>
              <button
                onClick={() => setStep('account-select')}
                style={{ width: '100%', padding: 13, background: selectedBank.color, border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 800, color: '#fff', cursor: 'pointer' }}
              >
                Link account
              </button>
            </div>
          )}

          {step === 'account-select' && selectedBank && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <BankLogo bank={selectedBank} size={44} />
              </div>
              <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 18px' }}>Please select an account to use</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {DEMO_ACCOUNTS.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => setSelectedAccountId(acc.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                      border: selectedAccountId === acc.id ? `1.5px solid ${selectedBank.color}` : `1px solid ${theme.color.border}`,
                      background: selectedAccountId === acc.id ? `${selectedBank.color}0d` : 'transparent',
                    }}
                  >
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${selectedAccountId === acc.id ? selectedBank.color : theme.color.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selectedAccountId === acc.id && <span style={{ width: 8, height: 8, borderRadius: '50%', background: selectedBank.color }} />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: theme.color.text1 }}>{acc.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11.5, color: theme.color.text4 }}>{acc.label} · {acc.masked}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: theme.color.text1 }}>{acc.currency} {acc.balance}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep('capture')}
                disabled={!selectedAccountId}
                style={{ width: '100%', padding: 13, background: selectedBank.color, border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 800, color: '#fff', cursor: selectedAccountId ? 'pointer' : 'not-allowed', opacity: selectedAccountId ? 1 : 0.5 }}
              >
                Continue
              </button>
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, color: theme.color.text4, marginTop: 14 }}>
                <Lock size={11} /> Secured with Bemspay
              </p>
            </div>
          )}

          {step === 'capture' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: theme.color.text1, margin: '0 0 20px' }}>Take a picture</p>
              <div style={{
                width: 140, height: 140, borderRadius: '50%', margin: '0 auto 18px',
                background: `linear-gradient(135deg, ${theme.color.gold}, ${theme.color.goldDark})`,
              }} />
              <p style={{ fontSize: 12.5, color: theme.color.text3, margin: '0 0 22px', lineHeight: 1.6 }}>
                Please make sure your face fit into the circle before taking the shot
              </p>
              <button onClick={() => setStep('success')} style={{ width: '100%', padding: 13, background: theme.color.gold, border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 800, color: theme.color.charcoal900, cursor: 'pointer' }}>
                Capture
              </button>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '10px 4px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: `2px solid ${theme.color.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <Check size={26} color={theme.color.success} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 800, color: theme.color.text1, margin: '0 0 10px' }}>Success</p>
              <p style={{ fontSize: 12.5, color: theme.color.text3, lineHeight: 1.6, margin: '0 0 22px' }}>
                Your account was successfully linked to Studio Arella. Start paying and funding your booking directly from the platform without your bank app
              </p>
              <button onClick={onClose} style={{ width: '100%', padding: 13, background: theme.color.gold, border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 800, color: theme.color.charcoal900, cursor: 'pointer' }}>
                Finish
              </button>
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, color: theme.color.text4, marginTop: 14 }}>
                <Lock size={11} /> Secured with Bemspay
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
