'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronDown, X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { AnimatedButton } from '@/components/ui/Animations';
import { theme } from '@/lib/theme';

const CREATIVE_SERVICE_OPTIONS = ['Ad Banner design', 'Ad storytelling'];

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${theme.color.border}`, fontSize: 14, boxSizing: 'border-box' as const, background: theme.color.surface, color: theme.color.text1 };

interface Props {
  open: boolean;
  onClose: () => void;
}

// Quick "Request Ad Creative Services" modal — submits to the real
// /creative-requests endpoint, auto-filling the account's business name and
// phone where available. Shared between /book and /my-ads.
export default function RequestCreativeServiceModal({ open, onClose }: Props) {
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [creativeService, setCreativeService] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [creativeBrief, setCreativeBrief] = useState('');
  const [creativePhone, setCreativePhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!creativeService) { toast('Please select a service', 'error'); return; }
    if (!creativeBrief.trim()) { toast('Please describe your creative brief', 'error'); return; }
    const phone = user?.phone || creativePhone.trim();
    if (!phone) { toast('Please enter a phone number so our team can reach you', 'error'); return; }

    setSubmitting(true);
    try {
      await api.post('/creative-requests', {
        business_name: user?.business_name || user?.name || 'Studio Arella advertiser',
        contact_phone: phone,
        description: `[${creativeService}] ${creativeBrief.trim()}`,
      });
      toast('Request sent — our creative team will reach out shortly.', 'success');
      onClose();
      setCreativeService('');
      setCreativeBrief('');
      setCreativePhone('');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not send your request. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)', padding: 16 }}>
      <div style={{ background: theme.color.surface, borderRadius: 24, width: '100%', maxWidth: 440, boxShadow: theme.shadow.lg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 8px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text2, display: 'flex' }}>
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: theme.color.text1, margin: 0 }}>Ad creative services</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text2, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setDropdownOpen(o => !o)}
              style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: creativeService ? theme.color.text1 : theme.color.text3 }}
            >
              <span>{creativeService || 'Select creative services'}</span>
              <ChevronDown size={15} color={theme.color.text3} />
            </div>
            {dropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 10, boxShadow: theme.shadow.md, zIndex: 20, overflow: 'hidden' }}>
                {CREATIVE_SERVICE_OPTIONS.map(opt => (
                  <div key={opt} onClick={() => { setCreativeService(opt); setDropdownOpen(false); }}
                    style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: theme.color.text1, cursor: 'pointer' }}
                    onMouseOver={e => (e.currentTarget.style.background = theme.color.surface2)}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          <textarea
            placeholder="Describe your Ad creative brief"
            value={creativeBrief}
            onChange={e => setCreativeBrief(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' as const }}
          />

          {!user?.phone && (
            <input
              type="tel"
              placeholder="Phone number (so our team can reach you)"
              value={creativePhone}
              onChange={e => setCreativePhone(e.target.value)}
              style={inputStyle}
            />
          )}

          <AnimatedButton
            onClick={handleSubmit}
            style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: theme.color.gold, color: theme.color.charcoal900, fontSize: 14, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Sending…' : 'Add service'}
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}
