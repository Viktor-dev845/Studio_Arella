'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Trash2,
  Clock,
  Loader2,
  CreditCard,
  Wallet,
  ShieldCheck,
  Check,
  ArrowRight,
  Globe,
  Layers,
  Monitor,
  Info,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/ToastProvider';
import { useCartStore, CartItem } from '@/store/cartStore';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, FadeCard } from '@/components/ui/Animations';
import { theme } from '@/lib/theme';
import CampaignPicker from '@/components/ui/CampaignPicker';
import Link from 'next/link';
import { usePreferencesStore } from '@/store/preferencesStore';
import { formatCurrency } from '@/lib/currency';

const F = theme.font.body;

function dateRangeLabel(slots: CartItem['slots']) {
  if (slots.length === 0) return '—';
  const starts = slots.map((s) => new Date(s.start).getTime()).sort((a, b) => a - b);
  const first = new Date(starts[0]);
  const last = new Date(starts[starts.length - 1]);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = new Date(slots[0].start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (starts.length === 1) return `${fmt(first)} at ${time}`;
  return `${fmt(first)} – ${fmt(last)} (${slots.length} days) at ${time}`;
}

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cart, removeFromCart, getCartTotal, clearCart } = useCartStore();
  const { currency, rates } = usePreferencesStore();
  const naira = (n: number) => formatCurrency(n, currency, rates);

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [checkingOut, setCheckingOut] = useState(false);
  const [paying, setPaying] = useState(false);
  const [reservedBookings, setReservedBookings] = useState<{ itemId: string; bookingId: string; cost: number }[] | null>(null);
  const [realTotal, setRealTotal] = useState(0);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const [walletBalance, setWalletBalance] = useState(0);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    api.get('/finances/balance')
      .then((res) => setWalletBalance(Number(res.data?.credits ?? 0)))
      .catch(() => toast('Could not load your wallet balance.', 'error'));
  }, []);

  const estimatedTotal = getCartTotal();
  const totalSlots = cart.reduce((acc, c) => acc + c.slots.length, 0);
  const hasSufficientBalance = walletBalance >= (reservedBookings ? realTotal : estimatedTotal);

  // Step 1 of checkout: reserve every cart item for real. Each item is a
  // separate real booking (different ads/screens can't share one), so this
  // is sequential, not a single atomic call — the backend has no
  // multi-booking endpoint. If any item fails (someone else took that slot
  // while it sat in cart, etc.) we stop immediately and tell the user
  // exactly which item and why; nothing has been charged yet at this point,
  // and any earlier item that did reserve successfully will safely expire
  // on its own 5-minute lock if not retried.
  const handleReserveAll = async (): Promise<{ itemId: string; bookingId: string; cost: number }[] | null> => {
    const results: { itemId: string; bookingId: string; cost: number }[] = [];
    for (const item of cart) {
      try {
        const res = await api.post('/bookings/reserve', {
          screen_id: item.screenId,
          ad_id: item.adId,
          slots: item.slots,
          campaign_id: campaignId || undefined,
        });
        results.push({ itemId: item.id, bookingId: res.data.booking_id, cost: Number(res.data.total_cost || 0) });
      } catch (err: any) {
        toast(`"${item.adTitle}": ${err?.response?.data?.message || 'Could not reserve this slot.'}`, 'error');
        return null;
      }
    }
    return results;
  };

  const handleProceedCheckout = async () => {
    if (cart.length === 0) { toast('Your cart is empty', 'error'); return; }
    if (paymentMethod === 'card' && cart.length > 1) {
      toast('Card checkout only supports one item at a time. Pay with wallet to check out multiple items together.', 'error');
      return;
    }

    setCheckingOut(true);
    try {
      const results = await handleReserveAll();
      if (!results) return;
      const total = results.reduce((s, r) => s + r.cost, 0);
      setReservedBookings(results);
      setRealTotal(total);

      if (paymentMethod === 'wallet') {
        if (walletBalance < total) {
          toast(`Insufficient wallet balance. This order costs ${naira(total)}.`, 'error');
          return;
        }
        setShowWalletModal(true);
      } else {
        const payRes = await api.post('/payments/initialize', { booking_id: results[0].bookingId });
        const checkoutUrl = payRes.data?.checkout_url || payRes.data?.authorization_url;
        if (checkoutUrl) window.location.href = checkoutUrl;
        else toast('Could not start payment. Please try again.', 'error');
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not start checkout. Please try again.', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  // Step 2 (wallet only): pay for every reserved booking. Real, sequential,
  // per-booking debits — if one fails partway (balance changed mid-way,
  // a booking's 5-minute lock expired before we got to it) we report
  // exactly what succeeded and what didn't rather than claiming a single
  // blanket "success" for the whole order.
  const handleConfirmWalletPayment = async () => {
    if (!reservedBookings || reservedBookings.length === 0) {
      toast('Your reservation expired — please try checking out again.', 'error');
      setShowWalletModal(false);
      setReservedBookings(null);
      return;
    }
    setPaying(true);
    let paidCount = 0;
    try {
      for (const b of reservedBookings) {
        await api.post('/payments/wallet', { booking_id: b.bookingId });
        paidCount++;
      }
      setWalletBalance((prev) => Math.max(0, prev - realTotal));
      clearCart();
      setShowWalletModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      const remaining = reservedBookings.length - paidCount;
      toast(
        paidCount > 0
          ? `${paidCount} of ${reservedBookings.length} bookings paid. ${remaining} failed: ${err?.response?.data?.message || 'payment error'}. Check My Bookings — you can retry the rest from there.`
          : err?.response?.data?.message || 'Payment failed. Please try again.',
        'error'
      );
      // Whatever did get paid is real and already in My Bookings — only
      // clear the items that are still genuinely unpaid.
      if (paidCount > 0) {
        const paidItemIds = new Set(reservedBookings.slice(0, paidCount).map((b) => b.itemId));
        paidItemIds.forEach((id) => removeFromCart(id));
      }
      setShowWalletModal(false);
      setReservedBookings(null);
    } finally {
      setPaying(false);
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => router.push('/book')}
                style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, color: theme.color.text2, padding: '8px 16px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, fontFamily: F }}
              >
                <ChevronLeft size={16} /> Keep Browsing Slots
              </button>
              <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.color.text1, margin: 0, letterSpacing: '-0.3px' }}>
                Cart & Checkout
              </h1>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => { clearCart(); toast('Cart cleared', 'success'); }}
                style={{ background: 'none', border: 'none', color: theme.color.error, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: F }}
              >
                <Trash2 size={14} /> Clear Cart
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <FadeCard delay={0.1} style={{ background: theme.color.surface, borderRadius: 24, border: `1px dashed ${theme.color.border2}`, padding: '80px 24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ width: 72, height: 72, borderRadius: 24, background: theme.color.goldLight, border: `1px solid ${theme.color.goldMid}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Wallet size={32} color={theme.color.gold} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: '0 0 8px', letterSpacing: '-0.3px' }}>
                Your cart is currently empty
              </h2>
              <p style={{ fontSize: 14, color: theme.color.text3, margin: '0 0 24px', maxWidth: 420, marginInline: 'auto', lineHeight: 1.5 }}>
                Add an ad from the Book Ad page — you can stage several bookings and pay for them together here.
              </p>
              <button
                onClick={() => router.push('/book')}
                style={{ background: theme.color.gold, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: theme.shadow.gold, fontFamily: F }}
              >
                Go Book a Slot
              </button>
            </FadeCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, alignItems: 'flex-start' }}>

              {/* LEFT: cart items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ background: theme.color.surface, borderRadius: 18, border: `1px solid ${theme.color.border}`, padding: 18, display: 'flex', gap: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    {item.adPreviewUrl ? (
                      <img src={item.adPreviewUrl} alt={item.adTitle} style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 12, background: theme.color.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Monitor size={22} color={theme.color.text4} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.adTitle}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Monitor size={12} color={theme.color.text3} />
                        <span style={{ fontSize: 12, color: theme.color.text3 }}>{item.screenName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={12} color={theme.color.text3} />
                        <span style={{ fontSize: 12, color: theme.color.text3 }}>{dateRangeLabel(item.slots)} · {item.slots.length} slot{item.slots.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.color.gold, fontWeight: 900, fontSize: 15 }}>{naira(item.estimatedCost)}</span>
                      <button
                        onClick={() => { removeFromCart(item.id); toast('Removed from cart', 'info'); }}
                        style={{ background: theme.color.surface2, border: `1px solid ${theme.color.border}`, cursor: 'pointer', padding: 6, borderRadius: 8, color: theme.color.error, display: 'flex' }}
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 18, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Layers size={16} color={theme.color.gold} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: theme.color.text1 }}>Attach to Campaign (Optional)</span>
                  </div>
                  <CampaignPicker value={campaignId} onChange={setCampaignId} />
                </div>
              </div>

              {/* RIGHT: order summary */}
              <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: theme.color.surface, borderRadius: 24, border: `1px solid ${theme.color.border}`, padding: '24px 26px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: '0 0 16px', letterSpacing: '-0.3px' }}>Order Summary</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: theme.color.text3 }}>
                      <span>Items</span>
                      <strong style={{ color: theme.color.text1 }}>{cart.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: theme.color.text3 }}>
                      <span>Total Slots</span>
                      <strong style={{ color: theme.color.text1 }}>{totalSlots}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: theme.color.text3 }}>
                      <span>Estimated Subtotal</span>
                      <strong style={{ color: theme.color.text1 }}>{naira(estimatedTotal)}</strong>
                    </div>
                  </div>

                  <div style={{ background: theme.color.infoLight, border: `1px solid ${theme.color.infoBorder}`, borderRadius: 10, padding: '8px 12px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Info size={13} color={theme.color.info} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 11, color: theme.color.text2, lineHeight: 1.5 }}>Slots are reserved for real only when you check out — the total is confirmed at that point.</span>
                  </div>

                  <div style={{ borderTop: `1px dashed ${theme.color.border}`, margin: '16px 0', width: '100%' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Due</span>
                    <span style={{ fontSize: 24, fontWeight: 900, color: theme.color.gold, letterSpacing: '-0.5px' }}>{naira(estimatedTotal)}</span>
                  </div>

                  <p style={{ fontSize: 12, fontWeight: 800, color: theme.color.text1, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Select Payment Method</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    <div
                      onClick={() => setPaymentMethod('wallet')}
                      style={{ border: paymentMethod === 'wallet' ? `1.5px solid ${theme.color.gold}` : `1px solid ${theme.color.border}`, background: paymentMethod === 'wallet' ? theme.color.goldLight : theme.color.surface, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: theme.color.warningLight, border: `1px solid ${theme.color.warning}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Wallet size={16} color={theme.color.warning} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 800, color: theme.color.text1, margin: 0 }}>Pay from Wallet</p>
                          <p style={{ fontSize: 11, color: theme.color.text3, margin: '2px 0 0', fontWeight: 600 }}>Bal: ₦{walletBalance.toLocaleString('en-NG', { maximumFractionDigits: 0 })} · Instant</p>
                        </div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: paymentMethod === 'wallet' ? `5px solid ${theme.color.gold}` : `2px solid ${theme.color.border2}`, background: theme.color.surface }} />
                    </div>

                    <div
                      onClick={() => setPaymentMethod('card')}
                      style={{ border: paymentMethod === 'card' ? `1.5px solid ${theme.color.gold}` : `1px solid ${theme.color.border}`, background: paymentMethod === 'card' ? theme.color.goldLight : theme.color.surface, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: cart.length > 1 ? 0.5 : 1 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: theme.color.infoLight, border: `1px solid ${theme.color.infoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CreditCard size={16} color={theme.color.info} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 800, color: theme.color.text1, margin: 0 }}>Card / Bank Transfer</p>
                          <p style={{ fontSize: 11, color: theme.color.text3, margin: '2px 0 0', fontWeight: 600 }}>
                            {cart.length > 1 ? 'Single item only — remove extras to use card' : 'Direct checkout via secure gateway'}
                          </p>
                        </div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: paymentMethod === 'card' ? `5px solid ${theme.color.gold}` : `2px solid ${theme.color.border2}`, background: theme.color.surface }} />
                    </div>
                  </div>

                  {paymentMethod === 'wallet' && (
                    <div style={{ background: hasSufficientBalance ? theme.color.successLight : theme.color.errorLight, border: `1px solid ${hasSufficientBalance ? theme.color.success : theme.color.error}`, borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                      {hasSufficientBalance ? (
                        <>
                          <Check size={16} color={theme.color.success} />
                          <span style={{ fontSize: 12, color: theme.color.success, fontWeight: 700 }}>Sufficient funds in wallet balance.</span>
                        </>
                      ) : (
                        <>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 12, color: theme.color.error, fontWeight: 700 }}>Insufficient funds. Need {naira(estimatedTotal - walletBalance)} more.</span>
                            <Link href="/finances" style={{ display: 'block', fontSize: 11, color: theme.color.gold, fontWeight: 800, textDecoration: 'underline', marginTop: 2 }}>+ Fund Wallet First</Link>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleProceedCheckout}
                    disabled={checkingOut || (paymentMethod === 'wallet' && !hasSufficientBalance) || (paymentMethod === 'card' && cart.length > 1)}
                    style={{ width: '100%', padding: '14px 20px', background: (checkingOut || (paymentMethod === 'wallet' && !hasSufficientBalance) || (paymentMethod === 'card' && cart.length > 1)) ? theme.color.border2 : theme.color.gold, color: '#FFFFFF', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: (checkingOut || (paymentMethod === 'wallet' && !hasSufficientBalance)) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: F }}
                  >
                    {checkingOut ? (
                      <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /><span>Reserving your slots...</span></>
                    ) : (
                      <><span>Proceed to Pay {naira(estimatedTotal)}</span><ArrowRight size={16} /></>
                    )}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, color: theme.color.text4, fontSize: 11, fontWeight: 600 }}>
                    <ShieldCheck size={14} color={theme.color.success} />
                    <span>256-Bit SSL Encrypted Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: Pay from wallet */}
        <AnimatePresence>
          {showWalletModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowWalletModal(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 440, pointerEvents: 'auto' }}>
                  <div style={{ background: theme.color.surface, borderRadius: 24, padding: '32px 28px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                      <button onClick={() => setShowWalletModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text1, padding: 4 }}><ChevronLeft size={20} /></button>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: 0 }}>Pay from wallet</h2>
                      <span style={{ width: 20 }} />
                    </div>
                    <div style={{ border: `1.5px solid ${theme.color.gold}`, borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: theme.color.text2 }}>Total amount ({reservedBookings?.length || 0} booking{(reservedBookings?.length || 0) !== 1 ? 's' : ''})</span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: theme.color.text1 }}>{naira(realTotal)}</span>
                    </div>
                    <button
                      onClick={handleConfirmWalletPayment}
                      disabled={paying}
                      style={{ width: '100%', padding: '14px', background: theme.color.gold, color: '#FFFFFF', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: paying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: F }}
                    >
                      {paying ? (<><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /><span>Processing Payment...</span></>) : (<span>Pay</span>)}
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* MODAL: Payment successful */}
        <AnimatePresence>
          {showSuccessModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { setShowSuccessModal(false); router.push('/bookings'); }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 440, pointerEvents: 'auto' }}>
                  <div style={{ background: theme.color.surface, borderRadius: 24, padding: '36px 28px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: `radial-gradient(circle, ${theme.color.gold} 0%, ${theme.color.goldDark} 100%)`, boxShadow: theme.shadow.gold, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                      <Check size={32} color="#FFFFFF" strokeWidth={3} />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: '0 0 28px', letterSpacing: '-0.3px' }}>Payment successful</h3>
                    <button
                      onClick={() => { setShowSuccessModal(false); router.push('/bookings'); }}
                      style={{ width: '100%', padding: '14px', background: theme.color.gold, color: '#FFFFFF', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: F }}
                    >
                      Finish
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Floating "Chat with Arella" widget */}
        <div className="chat-fab-widget" style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 90 }}>
          <div style={{ position: 'relative' }}>
            <Link
              href="/chat"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textDecoration: 'none', color: theme.color.text1, fontSize: 13, fontWeight: 700, fontFamily: F }}
            >
              <span className="chat-fab-label">Chat with Arella</span>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)', padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', background: theme.color.surface, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={13} color="#4F46E5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
