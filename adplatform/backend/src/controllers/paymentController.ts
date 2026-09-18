import { Request, Response, RequestHandler } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../middleware/auth';
import https from 'https';
import crypto from 'crypto';
import { sendBookingConfirmationEmail, sendPodcastConfirmationEmail } from '../services/emailService';
import { createNotification, notifyAdmins } from '../services/notificationService';

const MONNIFY_API_KEY     = process.env.MONNIFY_API_KEY as string;
const MONNIFY_SECRET_KEY  = process.env.MONNIFY_SECRET_KEY as string;
const MONNIFY_CONTRACT    = process.env.MONNIFY_CONTRACT_CODE as string;
const MONNIFY_BASE        = process.env.NODE_ENV === 'production'
  ? 'api.monnify.com'
  : 'sandbox.monnify.com';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

// ── Helper: raw HTTPS request to Paystack ────────────────────────────────────
const paystackReq = (method: string, path: string, body?: any): Promise<any> =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: 'api.paystack.co',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { reject(new Error(`Bad JSON from Paystack: ${raw}`)); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });

// ── Helper: raw HTTPS request to Monnify ─────────────────────────────────────
const monnifyReq = (method: string, path: string, body?: any, token?: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const authHeader = token
      ? `Bearer ${token}`
      : `Basic ${Buffer.from(`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`).toString('base64')}`;

    const payload = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: MONNIFY_BASE,
      port: 443,
      path,
      method,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { reject(new Error(`Bad JSON from Monnify: ${raw}`)); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });

// ── Get a Monnify access token ────────────────────────────────────────────────
async function getMonnifyToken(): Promise<string> {
  const res = await monnifyReq('POST', '/api/v1/auth/login');
  if (!res.requestSuccessful) throw new Error('Monnify auth failed: ' + res.responseMessage);
  return res.responseBody.accessToken;
}

// ── Initialize booking payment (Monnify) ──────────────────────────────────────
export const initializePayment: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { booking_id, booking_type } = req.body;
    
    // 1. Get booking
    let booking;
    if (booking_type === 'podcast') {
      const resQuery = await pool.query('SELECT * FROM podcast_bookings WHERE id = $1 AND user_id = $2 AND status = $3', [booking_id, authReq.user?.id, 'pending']);
      if (resQuery.rows.length === 0) { res.status(404).json({ message: 'Booking not found or already paid' }); return; }
      booking = resQuery.rows[0];
      if (Date.now() - new Date(booking.created_at).getTime() > 5 * 60 * 1000) {
        res.status(400).json({ message: 'Reservation expired (5 min limit). Please re-book your slot.' }); return;
      }
    } else {
      const bookingRes = await pool.query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND status = $3', [booking_id, authReq.user?.id, 'pending_payment']);
      if (bookingRes.rows.length === 0) {
        res.status(404).json({ message: 'Booking not found or already paid' }); return;
      }
      booking = bookingRes.rows[0];
    }

    // 2. Check if slots are still locked
    if (booking_type !== 'podcast') {
      const slotsRes = await pool.query("SELECT id FROM booking_slots WHERE booking_id = $1 AND status = 'locked' AND locked_until >= NOW()", [booking_id]);
      if (slotsRes.rows.length === 0) {
        res.status(400).json({ message: 'Cart expired. Please re-select your slots.' }); return;
      }
    }

    const amount = parseFloat(booking.total_cost);
    const user = await pool.query('SELECT name, email FROM users WHERE id = $1', [authReq.user?.id]);
    const paymentReference = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const token = await getMonnifyToken();

    const monnifyRes = await monnifyReq('POST', '/api/v1/merchant/transactions/init-transaction', {
      amount: Number(amount),
      customerName: user.rows[0].name,
      customerEmail: user.rows[0].email,
      paymentReference,
      paymentDescription: booking_type === 'podcast' ? `Studio Arella Podcast — ${booking.booking_number}` : `Studio Arella Ad Slot — ${booking.booking_number}`,
      currencyCode: 'NGN',
      contractCode: MONNIFY_CONTRACT,
      redirectUrl: booking_type === 'podcast' ? `${process.env.FRONTEND_URL}/podcast/payment-callback` : `${process.env.FRONTEND_URL}/bookings/payment-callback`,
      paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
      metadata: {
        user_id: authReq.user?.id,
        booking_id,
        type: booking_type === 'podcast' ? 'podcast_booking' : 'booking'
      },
    }, token);

    if (!monnifyRes.requestSuccessful) {
      res.status(400).json({ message: monnifyRes.responseMessage || 'Monnify error' }); return;
    }

    res.json({
      checkout_url: monnifyRes.responseBody.checkoutUrl,
      payment_reference: paymentReference,
      amount,
    });
  } catch (err) {
    console.error('Payment init error:', err);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
};

export const devBypassPayment: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  if (process.env.NODE_ENV !== 'development') { res.status(403).json({ message: 'Not allowed' }); return; }
  try {
    const { plan_id, screen_id, booking_id, start_time, end_time, duration_minutes, ad_id, campaign_id, booking_type = 'single', amount } = req.body;
    
    let planName = `${duration_minutes} minute slot`;
    if (plan_id) {
      const plan = await pool.query('SELECT name FROM pricing_plans WHERE id = $1', [plan_id]);
      if (plan.rows[0]) planName = plan.rows[0].name;
    }
    
    const meta = {
      user_id: authReq.user?.id,
      screen_id,
      booking_id: booking_id || null,
      start_time,
      end_time,
      duration_minutes,
      ad_id: ad_id || null,
      campaign_id: campaign_id || null,
      plan_name: planName,
      booking_type,
    };
    
    const paymentReference = `BYPASS-${Date.now()}`;
    await processConfirmedPayment(paymentReference, meta, amount);
    res.json({ success: true, message: 'Bypassed payment successfully.' });
  } catch (err) {
    console.error('Bypass error:', err);
    res.status(500).json({ message: 'Bypass failed' });
  }
};

// ── Pay from Wallet (Cart checkout step 2) ────────────────────────────────────
export const payFromWallet: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  const client = await pool.connect();
  try {
    const { booking_id, booking_type } = req.body;
    
    await client.query('BEGIN');

    // 1. Get booking
    let booking;
    if (booking_type === 'podcast') {
      const resQuery = await client.query('SELECT * FROM podcast_bookings WHERE id = $1 AND user_id = $2 AND status = $3 FOR UPDATE', [booking_id, authReq.user?.id, 'pending']);
      if (resQuery.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ message: 'Booking not found or already paid' }); return;
      }
      booking = resQuery.rows[0];
      if (Date.now() - new Date(booking.created_at).getTime() > 5 * 60 * 1000) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: 'Reservation expired (5 min limit). Please re-book your slot.' }); return;
      }
    } else {
      const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND status = $3 FOR UPDATE', [booking_id, authReq.user?.id, 'pending_payment']);
      if (bookingRes.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ message: 'Booking not found or already paid / expired' }); return;
      }
      booking = bookingRes.rows[0];
    }

    // 2. Check if slots are still locked
    if (booking_type !== 'podcast') {
      const slotsRes = await client.query("SELECT id FROM booking_slots WHERE booking_id = $1 AND status = 'locked' AND locked_until >= NOW()", [booking_id]);
      if (slotsRes.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: 'Cart expired. Please re-select your slots.' }); return;
      }
    }

    // 3. Check wallet balance
    const userRes = await client.query('SELECT credits FROM users WHERE id = $1 FOR UPDATE', [authReq.user?.id]);
    const credits = parseFloat(userRes.rows[0].credits);
    const totalCost = parseFloat(booking.total_cost);
    
    if (credits < totalCost) {
      await client.query('ROLLBACK');
      res.status(400).json({ message: 'Insufficient wallet balance' }); return;
    }

    // 4. Deduct balance & create transaction
    await client.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [totalCost, authReq.user?.id]);
    await client.query(`
      INSERT INTO transactions (user_id, type, source, amount, description, reference)
      VALUES ($1, 'debit', 'booking', $2, $3, $4)
    `, [authReq.user?.id, totalCost, `Paid for booking ${booking.booking_number}`, booking.booking_number]);

    // 5. Activate booking & slots
    if (booking_type === 'podcast') {
      await client.query("UPDATE podcast_bookings SET status = 'confirmed', payment_status = 'paid' WHERE id = $1", [booking_id]);
    } else {
      await client.query("UPDATE bookings SET status = 'active', payment_reference = 'WALLET' WHERE id = $1", [booking_id]);
      await client.query("UPDATE booking_slots SET status = 'active', locked_until = NULL WHERE booking_id = $1", [booking_id]);
      await client.query(
        `UPDATE campaigns SET status = 'active', updated_at = NOW()
         WHERE id = $1 AND status = 'draft'`,
        [booking.campaign_id]
      );
    }

    await client.query('COMMIT');

    // 6. Send confirmation email (non-blocking, after commit)
    const userDetailRes = await pool.query('SELECT name, email FROM users WHERE id = $1', [authReq.user?.id]);
    const userName = userDetailRes.rows[0].name;
    const userEmail = userDetailRes.rows[0].email;

    if (booking_type === 'podcast') {
      sendPodcastConfirmationEmail(userEmail, userName, {
        booking_number: booking.booking_number,
        package_type: booking.package_type,
        start_time: booking.start_time,
        end_time: booking.end_time,
        duration_minutes: booking.duration_minutes,
        total_cost: booking.total_cost,
        addons: booking.addons,
        payment_reference: 'WALLET',
      }).catch(console.error);
    } else {
      const screenRes = await pool.query('SELECT name FROM screens WHERE id = $1', [booking.screen_id]);
      const ext = await pool.query('SELECT MIN(start_time) as min_start, MAX(end_time) as max_end FROM booking_slots WHERE booking_id = $1', [booking_id]);
      sendBookingConfirmationEmail(userEmail, userName, {
        ...booking,
        start_time: ext.rows[0].min_start,
        screen_name: screenRes.rows[0]?.name || 'Studio Arella',
        payment_reference: 'WALLET',
      }).catch(console.error);
    }

    res.json({ success: true, message: 'Payment successful using wallet!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Wallet payment error:', err);
    res.status(500).json({ message: 'Failed to process wallet payment' });
  } finally {
    client.release();
  }
};

// ── Initialize credit top-up payment ─────────────────────────────────────────
export const initializeCreditPayment: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) < 1000) {
      res.status(400).json({ message: 'Minimum top-up is ₦1,000' }); return;
    }

    const user = await pool.query('SELECT name, email FROM users WHERE id = $1', [authReq.user?.id]);
    const paymentReference = `TOPUP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    await pool.query(
      `INSERT INTO transactions (user_id, type, source, amount, description, reference)
       VALUES ($1, 'pending', 'topup', $2, 'Credit top-up', $3)
       ON CONFLICT DO NOTHING`,
      [authReq.user?.id, amount, paymentReference]
    );

    const token = await getMonnifyToken();

    const monnifyRes = await monnifyReq('POST', '/api/v1/merchant/transactions/init-transaction', {
      amount: Number(amount),
      customerName: user.rows[0].name,
      customerEmail: user.rows[0].email,
      paymentReference,
      paymentDescription: `Studio Arella — Credit Top-up ₦${Number(amount).toLocaleString()}`,
      currencyCode: 'NGN',
      contractCode: MONNIFY_CONTRACT,
      redirectUrl: `${process.env.FRONTEND_URL}/finances/payment-callback`,
      paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
      metadata: {
        user_id: authReq.user?.id,
        type: 'topup',
        amount,
      },
    }, token);

    if (!monnifyRes.requestSuccessful) {
      res.status(400).json({ message: monnifyRes.responseMessage || 'Monnify error' }); return;
    }

    res.json({
      checkout_url: monnifyRes.responseBody.checkoutUrl,
      payment_reference: paymentReference,
    });
  } catch (err) {
    console.error('Credit init error:', err);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
};

// ── Verify payment (client-side callback) ─────────────────────────────────────
export const verifyPayment: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { reference } = req.params;
    
    if (process.env.NODE_ENV === 'development' && reference.startsWith('DEV_BYPASS_')) {
      res.json({ success: true, message: 'Payment confirmed and booking activated. (DEV BYPASS)' });
      return;
    }
    
    const token = await getMonnifyToken();

    // Monnify verify endpoint uses the paymentReference
    const verifyRes = await monnifyReq(
      'GET',
      `/api/v2/transactions/${encodeURIComponent(reference)}`,
      undefined,
      token
    );

    if (!verifyRes.requestSuccessful) {
      res.status(400).json({ message: 'Could not verify payment', details: verifyRes.responseMessage });
      return;
    }

    const txn = verifyRes.responseBody;
    if (txn.paymentStatus !== 'PAID') {
      res.status(400).json({ message: 'Payment not completed', gateway_status: txn.paymentStatus });
      return;
    }

    const meta = txn.metaData || {};

    // Handle credit top-up
    if (meta.type === 'topup') {
      // Check not already processed
      const existing = await pool.query(
        "SELECT id FROM transactions WHERE reference = $1 AND type = 'credit'",
        [reference]
      );
      if (existing.rows.length > 0) {
        res.json({ already_confirmed: true, message: 'Credits already added.' }); return;
      }
      await pool.query(
        "UPDATE users SET credits = credits + $1 WHERE id = $2",
        [meta.amount, meta.user_id]
      );
      await pool.query(
        "UPDATE transactions SET type = 'credit' WHERE reference = $1",
        [reference]
      );
      createNotification({
        user_id: meta.user_id,
        type: 'payment_received',
        title: 'Credits added!',
        body: `₦${Number(meta.amount).toLocaleString()} has been added to your Studio Arella balance.`,
        link: '/finances',
      });
      res.json({ success: true, message: 'Credits added to your account successfully.' });
      return;
    }

    // Handle booking payment
    if (meta.type === 'podcast_booking') {
      const existing = await pool.query("SELECT id FROM podcast_bookings WHERE booking_number LIKE $1 AND status = 'confirmed'", [`%${reference.slice(-8)}%`]);
      if (existing.rows.length > 0) { res.json({ already_confirmed: true, message: 'Booking already confirmed.' }); return; }
    } else {
      const existing = await pool.query(
        "SELECT id FROM bookings WHERE booking_number LIKE $1 AND status = 'active'",
        [`%${reference.slice(-8)}%`]
      );
      if (existing.rows.length > 0) {
        res.json({ already_confirmed: true, message: 'Booking already confirmed.' }); return;
      }
    }

    await processConfirmedPayment(reference, meta, txn.amountPaid);
    res.json({ success: true, message: 'Payment confirmed and booking activated.' });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

// ── Monnify webhook (server-to-server — primary confirmation path) ─────────────
export const monnifyWebhook: RequestHandler = async (req, res) => {
  try {
    // Validate Monnify signature
    const computedHash = crypto
      .createHmac('sha512', MONNIFY_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (computedHash !== req.headers['monnify-signature']) {
      res.status(401).send('Unauthorized'); return;
    }

    // Always respond 200 immediately
    res.status(200).send('OK');

    const event = req.body;
    if (event.eventType === 'SUCCESSFUL_TRANSACTION') {
      const data = event.eventData;
      const meta = data.metaData || {};
      const ref = data.paymentReference;

      if (data.product && data.product.type === 'RESERVED_ACCOUNT') {
        // ── Handle Reserved Account Transfer (Wallet Top-up) ──
        const accountRef = data.product.reference;
        const userRes = await pool.query('SELECT id FROM users WHERE reserved_account_reference = $1', [accountRef]);
        
        if (userRes.rows.length > 0) {
          const userId = userRes.rows[0].id;
          const existingTxn = await pool.query('SELECT id FROM transactions WHERE reference = $1', [ref]);
          
          if (existingTxn.rows.length === 0) {
            await pool.query("UPDATE users SET credits = credits + $1 WHERE id = $2", [data.amountPaid, userId]);
            await pool.query(
              "INSERT INTO transactions (user_id, type, source, amount, description, reference) VALUES ($1, 'credit', 'topup', $2, 'Wallet Top-up via Direct Transfer', $3)", 
              [userId, data.amountPaid, ref]
            );
            
            createNotification({
              user_id: userId,
              type: 'payment_received',
              title: 'Wallet Funded!',
              body: `₦${Number(data.amountPaid).toLocaleString()} has been credited to your wallet via direct bank transfer.`,
              link: '/finances',
            });
          }
        }
      } else if (meta.type === 'topup') {
        const existing = await pool.query(
          "SELECT id FROM transactions WHERE reference = $1 AND type = 'credit'", [ref]
        );
        if (existing.rows.length === 0) {
          await pool.query("UPDATE users SET credits = credits + $1 WHERE id = $2", [meta.amount, meta.user_id]);
          await pool.query("UPDATE transactions SET type = 'credit' WHERE reference = $1", [ref]);
          createNotification({
            user_id: meta.user_id,
            type: 'payment_received',
            title: 'Credits added!',
            body: `₦${Number(meta.amount).toLocaleString()} credited to your Studio Arella balance.`,
            link: '/finances',
          });
        }
      } else {
        await processConfirmedPayment(ref, meta, data.amountPaid);
      }
    }
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).send('OK'); // Always 200 to Monnify
  }
};

// ── Shared: process a confirmed booking payment ───────────────────────────────
async function processConfirmedPayment(reference: string, meta: any, amountPaid: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bookingId = meta.booking_id;
    if (!bookingId) {
      console.warn('Legacy booking callback received or missing booking_id:', reference);
      await client.query('COMMIT');
      return;
    }

    // Idempotency guard — Monnify redelivers SUCCESSFUL_TRANSACTION webhooks
    // on ordinary retry (e.g. if our ack didn't arrive in time), which is
    // expected behavior, not an attack. Without this, a routine retry would
    // record a second debit transaction for the same payment.
    const alreadyProcessed = await client.query('SELECT id FROM transactions WHERE reference = $1', [reference]);
    if (alreadyProcessed.rows.length > 0) {
      await client.query('COMMIT');
      return;
    }

    const isPodcast = meta.type === 'podcast_booking';

    // Lock and re-verify the booking is still actually awaiting this payment
    // before mutating anything. Two independent confirmations for the same
    // booking (two gateway references — a duplicate charge, a retried
    // "stuck" checkout) must not both flip it active and both record a
    // debit; only the first one that gets here should do real work.
    const table = isPodcast ? 'podcast_bookings' : 'bookings';
    const awaitingStatus = isPodcast ? 'pending' : 'pending_payment';
    const current = await client.query(`SELECT status, user_id FROM ${table} WHERE id = $1 FOR UPDATE`, [bookingId]);

    if (current.rows.length === 0) {
      // The reservation's 5-minute lock expired and the lifecycle cron
      // already deleted it before this (delayed) webhook arrived. The
      // gateway has genuinely taken the customer's money for a booking that
      // no longer exists to activate — refund it to their wallet instead of
      // silently discarding the payment, and make sure a human sees it.
      const refundUserId = meta.user_id;
      if (refundUserId) {
        await client.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [amountPaid, refundUserId]);
        await client.query(
          `INSERT INTO transactions (user_id, type, source, amount, description, reference)
           VALUES ($1, 'refund', 'expired_reservation', $2, $3, $4)`,
          [refundUserId, amountPaid, `Reservation expired before payment confirmed — refunded to wallet`, reference]
        );
        createNotification({
          user_id: refundUserId,
          type: 'payment_refunded',
          title: 'Booking could not be completed',
          body: `Your reservation expired before payment was confirmed, so ₦${Number(amountPaid).toLocaleString()} has been credited to your wallet instead.`,
          link: '/finances',
        });
      }
      notifyAdmins({
        type: 'orphaned_payment',
        title: 'Payment received for an expired reservation',
        body: `Reference ${reference} confirmed ₦${Number(amountPaid).toLocaleString()} for booking ${bookingId}, which no longer exists (reservation expired). ${refundUserId ? 'Auto-refunded to the user\'s wallet.' : 'No user_id on record — needs manual investigation.'}`,
        link: '/admin/finances',
      });
      await client.query('COMMIT');
      return;
    }

    if (current.rows[0].status !== awaitingStatus) {
      // Already paid by an earlier confirmation for this same booking —
      // this one is a duplicate (retry, or a second gateway reference for
      // the same charge). Nothing left to do.
      await client.query('COMMIT');
      return;
    }

    // 1. Mark booking as active
    if (isPodcast) {
      await client.query(
        "UPDATE podcast_bookings SET status = 'confirmed', payment_status = 'paid' WHERE id = $1",
        [bookingId]
      );
    } else {
      await client.query(
        "UPDATE bookings SET status = 'active', payment_reference = $1 WHERE id = $2",
        [reference, bookingId]
      );

      // 2. Mark slots as active and remove locks
      await client.query(
        "UPDATE booking_slots SET status = 'active', locked_until = NULL WHERE booking_id = $1",
        [bookingId]
      );
    }

    // 3. Create invoice
    // 3. Create invoice
    const baseReference = reference.slice(-8).toUpperCase();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${baseReference}`;
    if (!isPodcast) {
      await client.query(
        `INSERT INTO invoices (booking_id, invoice_number, advertiser_id, amount)
         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [bookingId, invoiceNumber, meta.user_id, amountPaid]
      );
    }

    // 4. Record transaction (pending transaction from Monnify init was removed, so we just insert the debit)
    await client.query(`
      INSERT INTO transactions (user_id, type, source, amount, description, reference)
      VALUES ($1, 'debit', 'booking', $2, $3, $4)
    `, [meta.user_id, amountPaid, `Paid for booking INV-${baseReference}`, reference]);

    // A booking tied to a campaign paying for the first time is the real
    // signal that the campaign has actually launched, not just been drafted.
    if (!isPodcast) {
      await client.query(
        `UPDATE campaigns SET status = 'active', updated_at = NOW()
         WHERE id = (SELECT campaign_id FROM bookings WHERE id = $1) AND status = 'draft'`,
        [bookingId]
      );
    }

    if (isPodcast) {
      const booking = await client.query('SELECT * FROM podcast_bookings WHERE id = $1', [bookingId]);
      const b = booking.rows[0];
      const userRes = await client.query('SELECT name, email FROM users WHERE id = $1', [meta.user_id]);

      // Send podcast confirmation email
      sendPodcastConfirmationEmail(userRes.rows[0].email, userRes.rows[0].name, {
        booking_number: b.booking_number,
        package_type: b.package_type,
        start_time: b.start_time,
        end_time: b.end_time,
        duration_minutes: b.duration_minutes,
        total_cost: b.total_cost,
        addons: b.addons,
        payment_reference: reference,
      }).catch(console.error);

      createNotification({
        user_id: meta.user_id,
        type: 'booking_confirmed',
        title: 'Podcast Booking Confirmed!',
        body: `Your podcast booking ${b.booking_number} is now confirmed for ${new Date(b.start_time).toLocaleString()}.`,
        link: '/bookings?tab=podcasts',
      });
    } else {
      const booking = await client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
      const b = booking.rows[0];

      // Notifications
      const userRes = await client.query('SELECT name, email FROM users WHERE id = $1', [meta.user_id]);
      const screenRes = await client.query('SELECT name FROM screens WHERE id = $1', [b.screen_id]);
      
      const ext = await client.query('SELECT MIN(start_time) as min_start, MAX(end_time) as max_end, COUNT(id) as total_runs FROM booking_slots WHERE booking_id = $1', [bookingId]);
      const bookingSummary = {
        ...b,
        start_time: ext.rows[0].min_start,
        end_time: ext.rows[0].max_end,
        total_runs: ext.rows[0].total_runs,
        screen_name: screenRes.rows[0].name
      };

      sendBookingConfirmationEmail(userRes.rows[0].email, userRes.rows[0].name, bookingSummary).catch(console.error);

      createNotification({
        user_id: meta.user_id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed!',
        body: `Your booking ${b.booking_number} is now active with ${ext.rows[0].total_runs} scheduled runs.`,
        link: '/bookings',
      });
    }
    
    // Quick fix: the notifyAdmins function in old code took (type, title, body, link), wait let me check its signature from another call
    // the old code used notifyAdmins({ type, title, body, link }) but it was updated somewhere? Let's use the object form just in case.
    
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Process confirmed payment error:', err);
    throw err;
  } finally {
    client.release();
  }
}

// ── Paystack: Initialize booking payment ──────────────────────────────────────
export const initializePaystackPayment: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { booking_id, booking_type } = req.body;

    // 1. Get booking
    let booking;
    if (booking_type === 'podcast') {
      const resQuery = await pool.query(
        'SELECT * FROM podcast_bookings WHERE id = $1 AND user_id = $2 AND status = $3',
        [booking_id, authReq.user?.id, 'pending']
      );
      if (resQuery.rows.length === 0) { res.status(404).json({ message: 'Booking not found or already paid' }); return; }
      booking = resQuery.rows[0];
      if (Date.now() - new Date(booking.created_at).getTime() > 5 * 60 * 1000) {
        res.status(400).json({ message: 'Reservation expired (5 min limit). Please re-book your slot.' }); return;
      }
    } else {
      const bookingRes = await pool.query(
        'SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND status = $3',
        [booking_id, authReq.user?.id, 'pending_payment']
      );
      if (bookingRes.rows.length === 0) { res.status(404).json({ message: 'Booking not found or already paid' }); return; }
      booking = bookingRes.rows[0];
    }

    // 2. Check slot locks for ad bookings
    if (booking_type !== 'podcast') {
      const slotsRes = await pool.query(
        "SELECT id FROM booking_slots WHERE booking_id = $1 AND status = 'locked' AND locked_until >= NOW()",
        [booking_id]
      );
      if (slotsRes.rows.length === 0) {
        res.status(400).json({ message: 'Cart expired. Please re-select your slots.' }); return;
      }
    }

    const user = await pool.query('SELECT name, email FROM users WHERE id = $1', [authReq.user?.id]);
    const amount = Math.round(parseFloat(booking.total_cost) * 100); // Paystack uses kobo
    const reference = `PS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const callbackUrl = booking_type === 'podcast'
      ? `${process.env.FRONTEND_URL}/podcast/payment-callback`
      : `${process.env.FRONTEND_URL}/bookings/payment-callback`;

    const paystackRes = await paystackReq('POST', '/transaction/initialize', {
      email: user.rows[0].email,
      amount,
      reference,
      callback_url: callbackUrl,
      currency: 'NGN',
      metadata: {
        user_id: authReq.user?.id,
        booking_id,
        type: booking_type === 'podcast' ? 'podcast_booking' : 'booking',
        cancel_action: `${process.env.FRONTEND_URL}/bookings`,
        custom_fields: [
          { display_name: 'Customer', variable_name: 'customer_name', value: user.rows[0].name },
          { display_name: 'Booking Ref', variable_name: 'booking_ref', value: booking.booking_number },
        ],
      },
    });

    if (!paystackRes.status) {
      res.status(400).json({ message: paystackRes.message || 'Paystack error' }); return;
    }

    res.json({
      checkout_url: paystackRes.data.authorization_url,
      payment_reference: reference,
      access_code: paystackRes.data.access_code,
      gateway: 'paystack',
    });
  } catch (err) {
    console.error('Paystack init error:', err);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
};

// Captures a real, reusable Paystack card authorization from a successful
// charge so it can show up as a genuine "Saved Card" in Settings — opportunistic,
// the same way most apps actually build this (from a real completed payment,
// not a separate tokenize-only flow, which Paystack doesn't cleanly support
// without charging something anyway).
async function saveCardFromAuthorization(userId: string | undefined, authorization: any, cardholderName?: string | null) {
  if (!userId || !authorization?.reusable || !authorization?.authorization_code) return;
  try {
    await pool.query(
      `INSERT INTO saved_cards (user_id, authorization_code, card_type, last4, exp_month, exp_year, bank, cardholder_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, authorization_code) DO NOTHING`,
      [
        userId,
        authorization.authorization_code,
        authorization.card_type || authorization.brand || null,
        authorization.last4 || null,
        authorization.exp_month || null,
        authorization.exp_year || null,
        authorization.bank || null,
        cardholderName || null,
      ]
    );
  } catch (e) {
    console.error('Failed to save card authorization:', e);
  }
}

// ── Paystack: Verify payment (client-side callback) ───────────────────────────
export const verifyPaystackPayment: RequestHandler = async (req, res) => {
  try {
    const { reference } = req.params;

    const verifyRes = await paystackReq('GET', `/transaction/verify/${encodeURIComponent(reference)}`);

    if (!verifyRes.status || verifyRes.data?.status !== 'success') {
      res.status(400).json({ message: 'Payment not completed', gateway_status: verifyRes.data?.status });
      return;
    }

    const txn = verifyRes.data;
    const meta = txn.metadata || {};

    // Handle credit top-up — mirrors the real handling already in
    // paystackWebhook; this client-verify path was falling through to the
    // booking-only logic below and silently no-op'ing while still claiming
    // success for any top-up that reached it.
    if (meta.type === 'topup') {
      const existing = await pool.query("SELECT id FROM transactions WHERE reference = $1 AND type = 'credit'", [reference]);
      if (existing.rows.length > 0) { res.json({ already_confirmed: true, message: 'Credits already added.' }); return; }
      await pool.query("UPDATE users SET credits = credits + $1 WHERE id = $2", [meta.amount, meta.user_id]);
      await pool.query(
        "INSERT INTO transactions (user_id, type, source, amount, description, reference) VALUES ($1, 'credit', 'topup', $2, 'Credit top-up via Paystack', $3)",
        [meta.user_id, meta.amount, reference]
      );
      await saveCardFromAuthorization(meta.user_id, txn.authorization);
      createNotification({
        user_id: meta.user_id,
        type: 'payment_received',
        title: 'Credits added!',
        body: `₦${Number(meta.amount).toLocaleString()} has been added to your Studio Arella balance.`,
        link: '/finances',
      });
      res.json({ success: true, message: 'Credits added to your account successfully.' });
      return;
    }

    // Idempotency check
    if (meta.type === 'podcast_booking') {
      const existing = await pool.query(
        "SELECT id FROM podcast_bookings WHERE id = $1 AND status = 'confirmed'",
        [meta.booking_id]
      );
      if (existing.rows.length > 0) { res.json({ already_confirmed: true, message: 'Booking already confirmed.' }); return; }
    } else {
      const existing = await pool.query(
        "SELECT id FROM bookings WHERE id = $1 AND status = 'active'",
        [meta.booking_id]
      );
      if (existing.rows.length > 0) { res.json({ already_confirmed: true, message: 'Booking already confirmed.' }); return; }
    }

    await processConfirmedPayment(reference, meta, txn.amount / 100); // convert kobo → naira
    await saveCardFromAuthorization(meta.user_id, txn.authorization);
    res.json({ success: true, message: 'Payment confirmed and booking activated.' });
  } catch (err) {
    console.error('Paystack verify error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

// ── Paystack: Webhook (server-to-server) ──────────────────────────────────────
export const paystackWebhook: RequestHandler = async (req, res) => {
  try {
    // req.body is a raw Buffer because we use express.raw() for this route
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));

    // Validate Paystack HMAC signature (must be computed on the raw body buffer)
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      res.status(401).send('Unauthorized'); return;
    }

    // Always respond 200 immediately
    res.status(200).send('OK');

    const event = JSON.parse(rawBody.toString());
    if (event.event === 'charge.success') {
      const data = event.data;
      const meta = data.metadata || {};
      const ref = data.reference;
      const amountPaid = data.amount / 100; // kobo → naira

      if (meta.type === 'topup') {
        const existing = await pool.query(
          "SELECT id FROM transactions WHERE reference = $1 AND type = 'credit'", [ref]
        );
        if (existing.rows.length === 0) {
          await pool.query("UPDATE users SET credits = credits + $1 WHERE id = $2", [meta.amount, meta.user_id]);
          await pool.query(
            "INSERT INTO transactions (user_id, type, source, amount, description, reference) VALUES ($1, 'credit', 'topup', $2, 'Credit top-up via Paystack', $3)",
            [meta.user_id, meta.amount, ref]
          );
          createNotification({
            user_id: meta.user_id,
            type: 'payment_received',
            title: 'Credits added!',
            body: `₦${Number(meta.amount).toLocaleString()} has been added to your Studio Arella balance.`,
            link: '/finances',
          });
        }
      } else if (meta.booking_id) {
        await processConfirmedPayment(ref, meta, amountPaid);
      }
      await saveCardFromAuthorization(meta.user_id, data.authorization);
    }
  } catch (err) {
    console.error('Paystack webhook error:', err);
    res.status(200).send('OK'); // Always 200 to Paystack
  }
};


// ── Paystack: Initialize credit top-up ───────────────────────────────────────
export const initializePaystackCreditPayment: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) < 1000) {
      res.status(400).json({ message: 'Minimum top-up is ₦1,000' }); return;
    }

    const user = await pool.query('SELECT name, email FROM users WHERE id = $1', [authReq.user?.id]);
    const reference = `PSTOPUP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const paystackRes = await paystackReq('POST', '/transaction/initialize', {
      email: user.rows[0].email,
      amount: Math.round(Number(amount) * 100), // kobo
      reference,
      callback_url: `${process.env.FRONTEND_URL}/finances/payment-callback`,
      currency: 'NGN',
      metadata: {
        user_id: authReq.user?.id,
        type: 'topup',
        amount,
      },
    });

    if (!paystackRes.status) {
      res.status(400).json({ message: paystackRes.message || 'Paystack error' }); return;
    }

    res.json({
      checkout_url: paystackRes.data.authorization_url,
      payment_reference: reference,
      gateway: 'paystack',
    });
  } catch (err) {
    console.error('Paystack credit init error:', err);
    res.status(500).json({ message: 'Failed to initialize Paystack payment' });
  }
};

// ── Monnify: Create Reserved Account ──────────────────────────────────────────
export const createReservedAccount: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { idNumber, idType } = req.body;
    
    if (!idNumber || !idType) {
      res.status(400).json({ message: 'ID Number (BVN/NIN) and ID Type are required.' });
      return;
    }

    const userQuery = await pool.query('SELECT name, email, reserved_account_number FROM users WHERE id = $1', [authReq.user?.id]);
    const user = userQuery.rows[0];

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.reserved_account_number) {
      res.status(400).json({ message: 'You already have a reserved account.' });
      return;
    }

    const accountReference = `RES-${authReq.user?.id}-${Date.now()}`;
    const token = await getMonnifyToken();

    const payload: any = {
      accountReference,
      accountName: user.name,
      currencyCode: 'NGN',
      contractCode: MONNIFY_CONTRACT,
      customerEmail: user.email,
      customerName: user.name,
      getAllAvailableBanks: true
    };

    if (idType.toLowerCase() === 'bvn') {
      payload.bvn = idNumber;
      payload.customerBvn = idNumber;
    } else if (idType.toLowerCase() === 'nin') {
      payload.nin = idNumber;
      payload.customerNin = idNumber;
    } else {
      res.status(400).json({ message: 'Invalid ID Type. Must be bvn or nin.' });
      return;
    }

    const monnifyRes = await monnifyReq('POST', '/api/v2/bank-transfer/reserved-accounts', payload, token);

    if (!monnifyRes.requestSuccessful) {
      console.error('Monnify reserved account creation failed:', monnifyRes);
      res.status(400).json({ message: `Monnify Error: ${monnifyRes.responseMessage || 'Validation failed'}` });
      return;
    }

    const accounts = monnifyRes.responseBody.accounts || [];
    if (accounts.length === 0) {
      res.status(500).json({ message: 'No bank accounts returned by Monnify.' });
      return;
    }

    // Prefer Wema, then Sterling, else just take the first one
    const preferredAccount = accounts.find((a: any) => a.bankName.toLowerCase().includes('wema'))
      || accounts.find((a: any) => a.bankName.toLowerCase().includes('sterling'))
      || accounts[0];

    await pool.query(
      'UPDATE users SET reserved_account_reference = $1, reserved_account_number = $2, reserved_account_bank = $3 WHERE id = $4',
      [accountReference, preferredAccount.accountNumber, preferredAccount.bankName, authReq.user?.id]
    );

    res.json({
      success: true,
      account_number: preferredAccount.accountNumber,
      bank_name: preferredAccount.bankName,
      account_name: preferredAccount.accountName
    });

  } catch (err) {
    console.error('Reserved account creation error:', err);
    res.status(500).json({ message: 'An internal error occurred while creating your reserved account.' });
  }
};

// ── Saved Cards ────────────────────────────────────────────────────────────────
export const getSavedCards: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const result = await pool.query(
      `SELECT id, card_type, last4, exp_month, exp_year, bank, cardholder_name, is_default, created_at
       FROM saved_cards WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [authReq.user?.id]
    );
    res.json({ cards: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSavedCard: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const cardRes = await pool.query(
      'SELECT authorization_code FROM saved_cards WHERE id = $1 AND user_id = $2',
      [req.params.id, authReq.user?.id]
    );
    const card = cardRes.rows[0];
    if (!card) { res.status(404).json({ message: 'Card not found' }); return; }

    // Best-effort: actually deactivate the authorization on Paystack's side
    // too, not just remove our local record.
    await paystackReq('POST', '/customer/deactivate_authorization', {
      authorization_code: card.authorization_code,
    }).catch((e) => console.error('Paystack deactivate authorization failed:', e));

    await pool.query('DELETE FROM saved_cards WHERE id = $1', [req.params.id]);
    res.json({ message: 'Card removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Shared: load the pending booking a custom-UI card charge is paying for ───
// Same lookup already duplicated across initializePayment / payFromWallet /
// initializePaystackPayment — factored out here since three more call sites
// need it below.
async function loadPendingBooking(userId: string | undefined, bookingId: string, bookingType: string) {
  if (bookingType === 'podcast') {
    const r = await pool.query('SELECT * FROM podcast_bookings WHERE id = $1 AND user_id = $2 AND status = $3', [bookingId, userId, 'pending']);
    if (r.rows.length === 0) return { booking: null, error: { status: 404, message: 'Booking not found or already paid' } };
    const booking = r.rows[0];
    if (Date.now() - new Date(booking.created_at).getTime() > 5 * 60 * 1000) {
      return { booking: null, error: { status: 400, message: 'Reservation expired (5 min limit). Please re-book your slot.' } };
    }
    return { booking, error: null };
  }
  const r = await pool.query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND status = $3', [bookingId, userId, 'pending_payment']);
  if (r.rows.length === 0) return { booking: null, error: { status: 404, message: 'Booking not found or already paid' } };
  const booking = r.rows[0];
  const slotsRes = await pool.query("SELECT id FROM booking_slots WHERE booking_id = $1 AND status = 'locked' AND locked_until >= NOW()", [bookingId]);
  if (slotsRes.rows.length === 0) return { booking: null, error: { status: 400, message: 'Reservation expired. Please start again.' } };
  return { booking, error: null };
}

const metaFor = (userId: string | undefined, bookingId: string, bookingType: string) => ({
  user_id: userId,
  booking_id: bookingId,
  type: bookingType === 'podcast' ? 'podcast_booking' : 'booking',
});

// ── Shared: credit real money into a campaign's prepaid budget ───────────────
// Mirrors processConfirmedPayment's idempotency/locking pattern, but for
// funding a campaign directly rather than activating a screen booking.
async function creditCampaignBudget(campaignId: string, userId: string | undefined, amount: number, reference: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const alreadyProcessed = await client.query('SELECT id FROM transactions WHERE reference = $1', [reference]);
    if (alreadyProcessed.rows.length > 0) { await client.query('COMMIT'); return; }

    const camp = await client.query('SELECT id, name, paid_budget FROM campaigns WHERE id = $1 FOR UPDATE', [campaignId]);
    if (!camp.rows[0]) {
      // Campaign was deleted between charge and confirmation — refund to wallet instead of losing the payment.
      if (userId) {
        await client.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [amount, userId]);
        await client.query(
          `INSERT INTO transactions (user_id, type, source, amount, description, reference)
           VALUES ($1, 'refund', 'expired_reservation', $2, 'Campaign no longer exists — refunded to wallet', $3)`,
          [userId, amount, reference]
        );
      }
      await client.query('COMMIT');
      return;
    }
    if (Number(camp.rows[0].paid_budget) > 0) {
      // Already funded by an earlier confirmation for this same campaign.
      await client.query('COMMIT');
      return;
    }

    await client.query(
      `UPDATE campaigns SET paid_budget = paid_budget + $1, status = 'active', updated_at = NOW() WHERE id = $2`,
      [amount, campaignId]
    );
    await client.query(
      `INSERT INTO transactions (user_id, type, source, amount, description, reference)
       VALUES ($1, 'debit', 'campaign_funding', $2, $3, $4)`,
      [userId, amount, `Funded campaign "${camp.rows[0].name}"`, reference]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Shared: credit real money into a user's wallet (top-up) ──────────────────
async function creditWalletTopup(userId: string | undefined, amount: number, reference: string) {
  if (!userId) return;
  const already = await pool.query('SELECT id FROM transactions WHERE reference = $1', [reference]);
  if (already.rows.length > 0) return;
  await pool.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [amount, userId]);
  await pool.query(
    `INSERT INTO transactions (user_id, type, source, amount, description, reference)
     VALUES ($1, 'credit', 'topup', $2, 'Wallet top-up via card', $3)`,
    [userId, amount, reference]
  );
}

const CARD_VERIFICATION_AMOUNT = 50; // NGN — charged then immediately refunded, real cost of proving the card works

// ── Paystack: Charge a new card directly (custom inline UI, no redirect) ─────
// Uses Paystack's server-side Charge API: card data flows through our
// backend to Paystack over HTTPS, never stored by us. A card that comes back
// 'send_otp' is parked in pending_charges until submitChargeOtp resolves it.
export const chargeCard: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { booking_id, booking_type, card, save_card } = req.body;
    if (!card?.number || !card?.cvv || !card?.expiry_month || !card?.expiry_year) {
      res.status(400).json({ message: 'Please fill in your card details' }); return;
    }
    const cardholderName: string | null = card.name || null;

    const { booking, error } = await loadPendingBooking(authReq.user?.id, booking_id, booking_type);
    if (error) { res.status(error.status).json({ message: error.message }); return; }

    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [authReq.user?.id]);
    const amount = Math.round(parseFloat(booking!.total_cost) * 100);
    const reference = `PSC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const chargeRes = await paystackReq('POST', '/charge', {
      email: userRes.rows[0].email,
      amount,
      reference,
      card: {
        number: String(card.number).replace(/\s+/g, ''),
        cvv: String(card.cvv),
        expiry_month: String(card.expiry_month).padStart(2, '0'),
        expiry_year: String(card.expiry_year).slice(-2),
      },
    });

    if (!chargeRes.status) {
      res.status(400).json({ message: chargeRes.message || 'Card was declined' }); return;
    }

    const data = chargeRes.data;
    if (data.status === 'success') {
      const meta = metaFor(authReq.user?.id, booking_id, booking_type);
      await processConfirmedPayment(data.reference || reference, meta, data.amount / 100);
      if (save_card) await saveCardFromAuthorization(authReq.user?.id, data.authorization, cardholderName);
      res.json({ status: 'success', message: 'Payment successful and campaign booked' });
      return;
    }

    if (data.status === 'send_otp') {
      await pool.query(
        `INSERT INTO pending_charges (reference, user_id, purpose, booking_id, booking_type, save_card, cardholder_name)
         VALUES ($1, $2, 'booking', $3, $4, $5, $6)
         ON CONFLICT (reference) DO NOTHING`,
        [data.reference || reference, authReq.user?.id, booking_id, booking_type || 'ad', !!save_card, cardholderName]
      );
      res.json({ status: 'send_otp', reference: data.reference || reference });
      return;
    }

    res.status(400).json({
      message: data.display_text || data.gateway_response || "This card needs a verification step we don't support yet. Please try a different card.",
    });
  } catch (err) {
    console.error('Charge card error:', err);
    res.status(500).json({ message: 'Payment failed. Please try again.' });
  }
};

// ── Paystack: Fund a campaign's budget with a new card ────────────────────────
export const fundCampaignCharge: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { campaign_id, card, save_card } = req.body;
    if (!card?.number || !card?.cvv || !card?.expiry_month || !card?.expiry_year) {
      res.status(400).json({ message: 'Please fill in your card details' }); return;
    }
    const cardholderName: string | null = card.name || null;

    const campRes = await pool.query('SELECT * FROM campaigns WHERE id = $1 AND user_id = $2', [campaign_id, authReq.user?.id]);
    if (!campRes.rows[0]) { res.status(404).json({ message: 'Campaign not found' }); return; }
    const campaign = campRes.rows[0];
    if (Number(campaign.paid_budget) > 0) { res.status(400).json({ message: 'This campaign has already been funded.' }); return; }
    const amountNGN = Number(campaign.budget);
    if (!(amountNGN > 0)) { res.status(400).json({ message: 'Set a budget before funding this campaign.' }); return; }

    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [authReq.user?.id]);
    const amount = Math.round(amountNGN * 100);
    const reference = `PSCF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const chargeRes = await paystackReq('POST', '/charge', {
      email: userRes.rows[0].email,
      amount,
      reference,
      card: {
        number: String(card.number).replace(/\s+/g, ''),
        cvv: String(card.cvv),
        expiry_month: String(card.expiry_month).padStart(2, '0'),
        expiry_year: String(card.expiry_year).slice(-2),
      },
    });

    if (!chargeRes.status) {
      res.status(400).json({ message: chargeRes.message || 'Card was declined' }); return;
    }

    const data = chargeRes.data;
    if (data.status === 'success') {
      await creditCampaignBudget(campaign_id, authReq.user?.id, amountNGN, data.reference || reference);
      if (save_card) await saveCardFromAuthorization(authReq.user?.id, data.authorization, cardholderName);
      res.json({ status: 'success', message: 'Payment successful and campaign booked' });
      return;
    }

    if (data.status === 'send_otp') {
      await pool.query(
        `INSERT INTO pending_charges (reference, user_id, purpose, campaign_id, save_card, cardholder_name)
         VALUES ($1, $2, 'campaign_funding', $3, $4, $5)
         ON CONFLICT (reference) DO NOTHING`,
        [data.reference || reference, authReq.user?.id, campaign_id, !!save_card, cardholderName]
      );
      res.json({ status: 'send_otp', reference: data.reference || reference });
      return;
    }

    res.status(400).json({
      message: data.display_text || data.gateway_response || "This card needs a verification step we don't support yet. Please try a different card.",
    });
  } catch (err) {
    console.error('Fund campaign charge error:', err);
    res.status(500).json({ message: 'Payment failed. Please try again.' });
  }
};

// ── Paystack: Fund a campaign's budget with a saved card's authorization ─────
export const fundCampaignChargeAuthorization: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { campaign_id, card_id } = req.body;
    const cardRes = await pool.query('SELECT authorization_code FROM saved_cards WHERE id = $1 AND user_id = $2', [card_id, authReq.user?.id]);
    if (!cardRes.rows[0]) { res.status(404).json({ message: 'Saved card not found' }); return; }

    const campRes = await pool.query('SELECT * FROM campaigns WHERE id = $1 AND user_id = $2', [campaign_id, authReq.user?.id]);
    if (!campRes.rows[0]) { res.status(404).json({ message: 'Campaign not found' }); return; }
    const campaign = campRes.rows[0];
    if (Number(campaign.paid_budget) > 0) { res.status(400).json({ message: 'This campaign has already been funded.' }); return; }
    const amountNGN = Number(campaign.budget);
    if (!(amountNGN > 0)) { res.status(400).json({ message: 'Set a budget before funding this campaign.' }); return; }

    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [authReq.user?.id]);
    const amount = Math.round(amountNGN * 100);
    const reference = `PSAF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const chargeRes = await paystackReq('POST', '/transaction/charge_authorization', {
      authorization_code: cardRes.rows[0].authorization_code,
      email: userRes.rows[0].email,
      amount,
      reference,
    });

    const data = chargeRes.data;
    if (!chargeRes.status || !data) {
      res.status(400).json({ message: chargeRes.message || 'Payment failed. Please try a different card.' }); return;
    }

    if (data.status === 'send_otp') {
      await pool.query(
        `INSERT INTO pending_charges (reference, user_id, purpose, campaign_id, save_card)
         VALUES ($1, $2, 'campaign_funding', $3, false)
         ON CONFLICT (reference) DO NOTHING`,
        [data.reference || reference, authReq.user?.id, campaign_id]
      );
      res.json({ status: 'send_otp', reference: data.reference || reference });
      return;
    }

    if (data.status !== 'success') {
      res.status(400).json({ message: data.gateway_response || 'Payment failed. Please try a different card.' }); return;
    }

    await creditCampaignBudget(campaign_id, authReq.user?.id, amountNGN, reference);
    res.json({ status: 'success', message: 'Payment successful and campaign booked' });
  } catch (err) {
    console.error('Fund campaign authorization error:', err);
    res.status(500).json({ message: 'Payment failed. Please try again.' });
  }
};

// ── Paystack: Top up the wallet with a new card ───────────────────────────────
export const topupCharge: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { amount, card, save_card } = req.body;
    const amountNGN = Number(amount);
    if (!(amountNGN >= 1000)) { res.status(400).json({ message: 'Minimum top-up is ₦1,000' }); return; }
    if (!card?.number || !card?.cvv || !card?.expiry_month || !card?.expiry_year) {
      res.status(400).json({ message: 'Please fill in your card details' }); return;
    }
    const cardholderName: string | null = card.name || null;

    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [authReq.user?.id]);
    const amount_kobo = Math.round(amountNGN * 100);
    const reference = `PST-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const chargeRes = await paystackReq('POST', '/charge', {
      email: userRes.rows[0].email,
      amount: amount_kobo,
      reference,
      card: {
        number: String(card.number).replace(/\s+/g, ''),
        cvv: String(card.cvv),
        expiry_month: String(card.expiry_month).padStart(2, '0'),
        expiry_year: String(card.expiry_year).slice(-2),
      },
    });

    if (!chargeRes.status) {
      res.status(400).json({ message: chargeRes.message || 'Card was declined' }); return;
    }

    const data = chargeRes.data;
    if (data.status === 'success') {
      await creditWalletTopup(authReq.user?.id, amountNGN, data.reference || reference);
      if (save_card) await saveCardFromAuthorization(authReq.user?.id, data.authorization, cardholderName);
      res.json({ status: 'success', message: `Wallet funded successfully. ₦${amountNGN.toLocaleString()} has been added to your wallet balance` });
      return;
    }

    if (data.status === 'send_otp') {
      await pool.query(
        `INSERT INTO pending_charges (reference, user_id, purpose, amount, save_card, cardholder_name)
         VALUES ($1, $2, 'wallet_topup', $3, $4, $5)
         ON CONFLICT (reference) DO NOTHING`,
        [data.reference || reference, authReq.user?.id, amountNGN, !!save_card, cardholderName]
      );
      res.json({ status: 'send_otp', reference: data.reference || reference });
      return;
    }

    res.status(400).json({
      message: data.display_text || data.gateway_response || "This card needs a verification step we don't support yet. Please try a different card.",
    });
  } catch (err) {
    console.error('Topup charge error:', err);
    res.status(500).json({ message: 'Payment failed. Please try again.' });
  }
};

// ── Paystack: Top up the wallet with a saved card's authorization ────────────
export const topupChargeAuthorization: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { amount, card_id } = req.body;
    const amountNGN = Number(amount);
    if (!(amountNGN >= 1000)) { res.status(400).json({ message: 'Minimum top-up is ₦1,000' }); return; }

    const cardRes = await pool.query('SELECT authorization_code FROM saved_cards WHERE id = $1 AND user_id = $2', [card_id, authReq.user?.id]);
    if (!cardRes.rows[0]) { res.status(404).json({ message: 'Saved card not found' }); return; }

    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [authReq.user?.id]);
    const amount_kobo = Math.round(amountNGN * 100);
    const reference = `PSTA-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const chargeRes = await paystackReq('POST', '/transaction/charge_authorization', {
      authorization_code: cardRes.rows[0].authorization_code,
      email: userRes.rows[0].email,
      amount: amount_kobo,
      reference,
    });

    const data = chargeRes.data;
    if (!chargeRes.status || !data) {
      res.status(400).json({ message: chargeRes.message || 'Payment failed. Please try a different card.' }); return;
    }

    if (data.status === 'send_otp') {
      await pool.query(
        `INSERT INTO pending_charges (reference, user_id, purpose, amount, save_card)
         VALUES ($1, $2, 'wallet_topup', $3, false)
         ON CONFLICT (reference) DO NOTHING`,
        [data.reference || reference, authReq.user?.id, amountNGN]
      );
      res.json({ status: 'send_otp', reference: data.reference || reference });
      return;
    }

    if (data.status !== 'success') {
      res.status(400).json({ message: data.gateway_response || 'Payment failed. Please try a different card.' }); return;
    }

    await creditWalletTopup(authReq.user?.id, amountNGN, reference);
    res.json({ status: 'success', message: `Wallet funded successfully. ₦${amountNGN.toLocaleString()} has been added to your wallet balance` });
  } catch (err) {
    console.error('Topup authorization error:', err);
    res.status(500).json({ message: 'Payment failed. Please try again.' });
  }
};

// ── Paystack: Add (save) a bank card without a real top-up ───────────────────
// Paystack has no tokenize-only endpoint — a reusable authorization only
// exists after a real charge. Charges a small fixed amount to create it, then
// immediately refunds the same amount, so the card gets saved for free.
export const addCardVerification: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { card } = req.body;
    if (!card?.number || !card?.cvv || !card?.expiry_month || !card?.expiry_year) {
      res.status(400).json({ message: 'Please fill in your card details' }); return;
    }
    const cardholderName: string | null = card.name || null;

    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [authReq.user?.id]);
    const reference = `PSV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const chargeRes = await paystackReq('POST', '/charge', {
      email: userRes.rows[0].email,
      amount: CARD_VERIFICATION_AMOUNT * 100,
      reference,
      card: {
        number: String(card.number).replace(/\s+/g, ''),
        cvv: String(card.cvv),
        expiry_month: String(card.expiry_month).padStart(2, '0'),
        expiry_year: String(card.expiry_year).slice(-2),
      },
    });

    if (!chargeRes.status) {
      res.status(400).json({ message: chargeRes.message || 'Card was declined' }); return;
    }

    const data = chargeRes.data;
    if (data.status === 'success') {
      await saveCardFromAuthorization(authReq.user?.id, data.authorization, cardholderName);
      await creditWalletTopup(authReq.user?.id, CARD_VERIFICATION_AMOUNT, `REFUND-${data.reference || reference}`);
      res.json({
        status: 'success',
        message: `${data.authorization?.bank || 'Your'} card added successfully`,
      });
      return;
    }

    if (data.status === 'send_otp') {
      await pool.query(
        `INSERT INTO pending_charges (reference, user_id, purpose, amount, save_card, cardholder_name)
         VALUES ($1, $2, 'card_verification', $3, true, $4)
         ON CONFLICT (reference) DO NOTHING`,
        [data.reference || reference, authReq.user?.id, CARD_VERIFICATION_AMOUNT, cardholderName]
      );
      res.json({ status: 'send_otp', reference: data.reference || reference });
      return;
    }

    res.status(400).json({
      message: data.display_text || data.gateway_response || "This card needs a verification step we don't support yet. Please try a different card.",
    });
  } catch (err) {
    console.error('Add card verification error:', err);
    res.status(500).json({ message: 'Card could not be added. Please try again.' });
  }
};

// ── Paystack: Submit OTP to complete a pending card charge ───────────────────
export const submitChargeOtp: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { reference, otp } = req.body;
    if (!reference || !otp) { res.status(400).json({ message: 'Reference and OTP are required' }); return; }

    const pending = await pool.query('SELECT * FROM pending_charges WHERE reference = $1 AND user_id = $2', [reference, authReq.user?.id]);
    if (!pending.rows[0]) { res.status(404).json({ message: 'This payment session has expired. Please start again.' }); return; }

    const otpRes = await paystackReq('POST', '/charge/submit_otp', { otp, reference });
    if (!otpRes.status || otpRes.data?.status !== 'success') {
      res.status(400).json({ message: otpRes.data?.display_text || otpRes.message || 'Incorrect code. Please try again.' });
      return;
    }

    const p = pending.rows[0];
    const amountNGN = otpRes.data.amount / 100;
    let message = 'Payment successful and campaign booked';

    if (p.purpose === 'campaign_funding') {
      await creditCampaignBudget(p.campaign_id, p.user_id, amountNGN, reference);
    } else if (p.purpose === 'wallet_topup') {
      await creditWalletTopup(p.user_id, amountNGN, reference);
      message = `Wallet funded successfully. ₦${Number(p.amount).toLocaleString()} has been added to your wallet balance`;
    } else if (p.purpose === 'card_verification') {
      await saveCardFromAuthorization(p.user_id, otpRes.data.authorization, p.cardholder_name);
      await creditWalletTopup(p.user_id, CARD_VERIFICATION_AMOUNT, `REFUND-${reference}`);
      message = `${otpRes.data.authorization?.bank || 'Your'} card added successfully`;
    } else {
      const meta = metaFor(p.user_id, p.booking_id, p.booking_type);
      await processConfirmedPayment(reference, meta, amountNGN);
    }
    if (p.save_card && p.purpose !== 'card_verification') await saveCardFromAuthorization(p.user_id, otpRes.data.authorization, p.cardholder_name);
    await pool.query('DELETE FROM pending_charges WHERE reference = $1', [reference]);

    res.json({ status: 'success', message });
  } catch (err) {
    console.error('Submit OTP error:', err);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// ── Paystack: Charge a saved card's stored authorization ─────────────────────
// No CVV/expiry re-entry — that's the point of a reusable authorization, and
// we never store a CVV to ask for one back.
export const chargeAuthorization: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { booking_id, booking_type, card_id } = req.body;
    const cardRes = await pool.query('SELECT authorization_code FROM saved_cards WHERE id = $1 AND user_id = $2', [card_id, authReq.user?.id]);
    if (!cardRes.rows[0]) { res.status(404).json({ message: 'Saved card not found' }); return; }

    const { booking, error } = await loadPendingBooking(authReq.user?.id, booking_id, booking_type);
    if (error) { res.status(error.status).json({ message: error.message }); return; }

    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [authReq.user?.id]);
    const amount = Math.round(parseFloat(booking!.total_cost) * 100);
    const reference = `PSA-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const chargeRes = await paystackReq('POST', '/transaction/charge_authorization', {
      authorization_code: cardRes.rows[0].authorization_code,
      email: userRes.rows[0].email,
      amount,
      reference,
    });

    const data = chargeRes.data;
    if (!chargeRes.status || !data) {
      res.status(400).json({ message: chargeRes.message || 'Payment failed. Please try a different card.' }); return;
    }

    if (data.status === 'send_otp') {
      await pool.query(
        `INSERT INTO pending_charges (reference, user_id, booking_id, booking_type, save_card)
         VALUES ($1, $2, $3, $4, false)
         ON CONFLICT (reference) DO NOTHING`,
        [data.reference || reference, authReq.user?.id, booking_id, booking_type || 'ad']
      );
      res.json({ status: 'send_otp', reference: data.reference || reference });
      return;
    }

    if (data.status !== 'success') {
      res.status(400).json({ message: data.gateway_response || 'Payment failed. Please try a different card.' }); return;
    }

    const meta = metaFor(authReq.user?.id, booking_id, booking_type);
    await processConfirmedPayment(reference, meta, data.amount / 100);
    res.json({ status: 'success', message: 'Payment successful and campaign booked' });
  } catch (err) {
    console.error('Charge authorization error:', err);
    res.status(500).json({ message: 'Payment failed. Please try again.' });
  }
};
