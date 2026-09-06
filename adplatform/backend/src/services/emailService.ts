import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use a verified domain if set, otherwise use the testing sandbox
const FROM = process.env.RESEND_FROM_EMAIL || 'Studio Arella <onboarding@resend.dev>';

// ── Base email template ───────────────────────────────────────────────────────
const FRONTEND = process.env.FRONTEND_URL || 'https://studioarella.com';

const wrap = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#050505;font-family:'Inter',-apple-system,BlinkMacSystemFont,Arial,sans-serif">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#050505" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0A0A0A;border:1px solid rgba(212,175,55,0.15);border-radius:24px;overflow:hidden;box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          
          <!-- Premium Header -->
          <tr>
            <td align="center" style="padding: 40px 32px 30px;background: linear-gradient(180deg, rgba(212,175,55,0.08) 0%, rgba(10,10,10,0) 100%);">
              <img src="https://raw.githubusercontent.com/Viktor2025-bit/Studio_Arella/main/adplatform/frontend/public/logo-white.png" alt="Studio Arella" width="160" style="display:block;width:160px;max-width:100%;height:auto;margin:0 auto;" />
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 10px 48px 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Minimalist Footer -->
          <tr>
            <td align="center" style="padding: 24px 48px;background-color:#050505;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="font-size:12px;color:#A1A1AA;line-height:1.6;margin:0 0 8px;font-weight:500;">
                <strong style="color:#FFFFFF;">Studio Arella</strong><br/>
                Bems Junction, Finbars, Bende Road, Umuahia, Abia State
              </p>
              <p style="font-size:12px;color:#A1A1AA;margin:0;">
                Need help? Contact support at 08164523926
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const btn = (text: string, url: string) =>
  `<a href="${url}" style="display:inline-block;background-color:#D4AF37;color:#0A0A0A;padding:16px 32px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;margin-top:28px;text-transform:uppercase;letter-spacing:0.5px;">${text}</a>`;

const h1 = (text: string) =>
  `<h1 style="font-size:26px;font-weight:800;color:#FFFFFF;margin:0 0 16px;letter-spacing:-0.03em;text-align:center;">${text}</h1>`;

const p = (text: string, muted = false, alignCenter = false) =>
  `<p style="font-size:16px;color:${muted ? '#A1A1AA' : '#FFFFFF'};line-height:1.8;margin:0 0 16px;font-weight:400;text-align:${alignCenter ? 'center' : 'left'};">${text}</p>`;

const row = (label: string, value: string) =>
  `<tr><td style="padding:14px 18px;font-size:14px;color:#94A3B8;border-bottom:1px solid rgba(255,255,255,0.05);white-space:nowrap">${label}</td><td style="padding:14px 18px;font-size:14px;font-weight:600;color:#F8FAFC;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">${value}</td></tr>`;

const table = (rows: string) =>
  `<table width="100%" style="width:100%;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:16px;border-collapse:collapse;margin:24px 0;overflow:hidden">${rows}</table>`;

// Helper function to send via Resend and throw nicely if it fails
async function sendEmail(options: { to: string; subject: string; html: string }) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

// ── 1. Email verification ─────────────────────────────────────────────────────
export async function sendVerificationEmail(to: string, name: string, code: string) {
  await sendEmail({
    to,
    subject: 'Verification Code — Studio Arella',
    html: wrap(`
      ${h1('Verify Your Email')}
      ${p(`Welcome to the future of digital advertising, ${name}. Please use the secure 6-digit code below to authenticate your account.`, false, true)}
      
      <!-- OTP Box -->
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:36px 0;">
        <tr>
          <td align="center">
            <div style="background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.25);border-radius:16px;padding:32px;display:inline-block;">
              <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#D4AF37;font-family:'Courier New',Courier,monospace;line-height:1;">${code}</span>
            </div>
          </td>
        </tr>
      </table>

      ${p('For your security, this authentication code will expire in 24 hours. If you did not initiate this request, please safely ignore this email.', true, true)}
    `),
  });
}

// ── 2. Welcome email (after verification) ────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail({
    to,
    subject: `Welcome to Studio Arella, ${name}!`,
    html: wrap(`
      ${h1(`Welcome aboard, ${name}!`)}
      ${p('Your account is now active. You can book ad slots on the <strong>Studio Arella</strong> LED screen at Bems Junction, Umuahia — starting from just ₦1,000 per minute.')}
      ${table(
        row('Screen', 'Studio Arella — Bems Junction') +
        row('Location', 'Finbars, Bende Road, Umuahia, Abia State') +
        row('Starting from', '₦1,000 per minute')
      )}
      ${btn('Book your first ad slot', `${process.env.FRONTEND_URL}/book`)}
    `),
  });
}

// ── 3. Password reset ─────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, name: string, code: string) {
  await sendEmail({
    to,
    subject: 'Reset your password — Studio Arella',
    html: wrap(`
      ${h1('Reset your password')}
      ${p(`Hi ${name}, we received a request to reset your Studio Arella password. Please use the 6-digit code below to set a new password:`)}
      <div style="background:#F9F7F5;border:1px dashed #E5E7EB;padding:24px;border-radius:12px;text-align:center;margin:24px 0">
        <span style="font-size:32px;font-weight:900;letter-spacing:6px;color:#0A0A0A">${code}</span>
      </div>
      ${p(`This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.`, true)}
    `),
  });
}

// ── 4. Booking confirmation ───────────────────────────────────────────────────
export async function sendBookingConfirmationEmail(to: string, name: string, booking: {
  booking_number: string;
  screen_name: string;
  start_time: string;
  duration_minutes: number;
  total_cost: number;
  creative_title?: string;
  payment_reference: string;
}) {
  await sendEmail({
    to,
    subject: `Booking confirmed: ${booking.booking_number} — Studio Arella`,
    html: wrap(`
      ${h1('Your booking is confirmed!')}
      ${p(`Hi ${name}, your ad slot on Studio Arella has been secured. Here are your booking details:`)}
      ${table(
        row('Booking Reference', booking.booking_number) +
        row('Screen', booking.screen_name) +
        row('Scheduled Date & Time', new Date(booking.start_time).toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' })) +
        row('Duration', `${booking.duration_minutes} minute${booking.duration_minutes > 1 ? 's' : ''}`) +
        row('Creative', booking.creative_title || 'Not specified') +
        row('Amount Paid', `₦${Number(booking.total_cost).toLocaleString()}`) +
        row('Payment Reference', booking.payment_reference)
      )}
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:14px 18px;margin-top:16px">
        <p style="font-size:13px;color:#15803D;font-weight:700;margin:0">Your ad will play as scheduled. You can track it live from your dashboard.</p>
      </div>
      ${btn('View my booking', `${process.env.FRONTEND_URL}/bookings`)}
    `),
  });
}

// ── 5. Podcast booking confirmation ──────────────────────────────────────────
export async function sendPodcastConfirmationEmail(to: string, name: string, booking: {
  booking_number: string;
  package_type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_cost: number;
  addons?: string;
  payment_reference?: string;
}) {
  const addonsText = (() => {
    try {
      const parsed = typeof booking.addons === 'string' ? JSON.parse(booking.addons) : booking.addons;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((a: any) => a.name).join(', ');
      }
    } catch {}
    return 'None';
  })();

  await sendEmail({
    to,
    subject: `Podcast session confirmed: ${booking.booking_number} — Studio Arella`,
    html: wrap(`
      ${h1('Your podcast session is booked!')}
      ${p(`Hi ${name}, your Studio Arella podcast recording session has been confirmed and reserved. Here are your session details:`)}
      ${table(
        row('Booking Reference', booking.booking_number) +
        row('Package', `${booking.package_type} Package`) +
        row('Session Date', new Date(booking.start_time).toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' })) +
        row('Session End', new Date(booking.end_time).toLocaleTimeString('en-NG', { timeStyle: 'short' })) +
        row('Duration', `${booking.duration_minutes} hour${booking.duration_minutes > 1 ? 's' : ''}`) +
        row('Add-ons', addonsText) +
        row('Amount Paid', `₦${Number(booking.total_cost).toLocaleString()}`) +
        (booking.payment_reference ? row('Payment Reference', booking.payment_reference) : '')
      )}
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:14px 18px;margin-top:16px">
        <p style="font-size:13px;color:#15803D;font-weight:700;margin:0">📍 Studio Arella · Bems Junction, Finbars, Bende Road, Umuahia, Abia State</p>
      </div>
      ${p('Please arrive at least 10 minutes before your session. If you need to reschedule or have any questions, contact us on <strong>08164523926</strong>.', true)}
      ${btn('View my bookings', `${process.env.FRONTEND_URL}/bookings?tab=podcasts`)}
    `),
  });
}

// ── 5. Creative approved ──────────────────────────────────────────────────────
export async function sendCreativeApprovedEmail(to: string, name: string, creativeName: string) {
  await sendEmail({
    to,
    subject: `Creative approved: "${creativeName}" — Studio Arella`,
    html: wrap(`
      ${h1('Your creative has been approved!')}
      ${p(`Hi ${name}, great news — your ad creative <strong>"${creativeName}"</strong> has been reviewed and approved by our team.`)}
      ${p('It is now ready to attach to a booking. Head to your dashboard to book your slot on Studio Arella.')}
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:14px 18px;margin:16px 0">
        <p style="font-size:13px;color:#15803D;font-weight:700;margin:0">Status: APPROVED — Ready for booking</p>
      </div>
      ${btn('Book a slot now', `${process.env.FRONTEND_URL}/book`)}
    `),
  });
}

// ── 6. Creative rejected ──────────────────────────────────────────────────────
export async function sendCreativeRejectedEmail(to: string, name: string, creativeName: string, reason: string) {
  await sendEmail({
    to,
    subject: `Creative not approved: "${creativeName}" — Studio Arella`,
    html: wrap(`
      ${h1('Creative not approved')}
      ${p(`Hi ${name}, unfortunately your ad creative <strong>"${creativeName}"</strong> could not be approved.`)}
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:14px 18px;margin:16px 0">
        <p style="font-size:12px;color:#9CA3AF;margin:0 0 4px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Reason for rejection</p>
        <p style="font-size:14px;color:#B91C1C;margin:0;font-weight:600">${reason}</p>
      </div>
      ${p('Please review the feedback, make the necessary changes to your creative, and re-upload. If you need help, contact us on 08164523926.')}
      ${btn('Upload a new creative', `${process.env.FRONTEND_URL}/ads`)}
    `),
  });
}

// ── 7. Booking reminder (24h before) ─────────────────────────────────────────
export async function sendBookingReminderEmail(to: string, name: string, booking: {
  booking_number: string;
  screen_name: string;
  start_time: string;
  duration_minutes: number;
}) {
  await sendEmail({
    to,
    subject: `Reminder: Your ad goes live tomorrow — ${booking.booking_number}`,
    html: wrap(`
      ${h1('Your ad plays tomorrow!')}
      ${p(`Hi ${name}, this is a reminder that your ad slot on Studio Arella is scheduled for tomorrow.`)}
      ${table(
        row('Booking Reference', booking.booking_number) +
        row('Screen', booking.screen_name) +
        row('Scheduled Time', new Date(booking.start_time).toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' })) +
        row('Duration', `${booking.duration_minutes} minute${booking.duration_minutes > 1 ? 's' : ''}`)
      )}
      ${p('No action needed — your ad is all set. You can track proof-of-play from your dashboard after it runs.', true)}
      ${btn('View my booking', `${process.env.FRONTEND_URL}/bookings`)}
    `),
  });
}

// ── 8. Cancellation confirmation ──────────────────────────────────────────────
export async function sendCancellationEmail(to: string, name: string, booking: {
  booking_number: string;
  refund_amount: number;
}) {
  const hasRefund = booking.refund_amount > 0;
  await sendEmail({
    to,
    subject: `Booking cancelled: ${booking.booking_number} — Studio Arella`,
    html: wrap(`
      ${h1('Booking cancelled')}
      ${p(`Hi ${name}, your booking <strong>${booking.booking_number}</strong> has been cancelled.`)}
      ${hasRefund
        ? `${table(row('Refund Amount', `₦${Number(booking.refund_amount).toLocaleString()}`))}
           <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:14px 18px;margin:16px 0">
             <p style="font-size:13px;color:#15803D;font-weight:700;margin:0">₦${Number(booking.refund_amount).toLocaleString()} has been credited to your Studio Arella wallet.</p>
           </div>`
        : `<div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:14px 18px;margin:16px 0">
             <p style="font-size:13px;color:#C2410C;font-weight:700;margin:0">This cancellation was within 48 hours of the scheduled slot. No refund is applicable per our cancellation policy.</p>
           </div>`}
      ${btn('View my bookings', `${process.env.FRONTEND_URL}/bookings`)}
    `),
  });
}

// ── 9. Admin Alert: New Creative ──────────────────────────────────────────────
export async function sendAdminNewCreativeAlert(to: string, advertiserName: string, creativeTitle: string) {
  await sendEmail({
    to,
    subject: `Action Required: Review new creative "${creativeTitle}"`,
    html: wrap(`
      ${h1('New creative awaiting review')}
      ${p(`Hello Admin,`)}
      ${p(`<strong>${advertiserName}</strong> just uploaded a new ad creative titled <strong>"${creativeTitle}"</strong>.`)}
      ${p('It is currently marked as pending and requires your immediate approval or rejection before it can be used in any bookings.')}
      ${btn('Review creative now', `${process.env.FRONTEND_URL}/admin/review`)}
    `),
  });
}

// ── 10. Admin Alert: New Creative Request ─────────────────────────────────────
export async function sendCreativeRequestAdminAlert(
  to: string, 
  businessName: string, 
  adType: string, 
  description: string, 
  contact: string
) {
  await sendEmail({
    to,
    subject: `New Creative Request: ${businessName}`,
    html: wrap(`
      ${h1('New creative request received')}
      ${p(`Hello Admin,`)}
      ${p(`<strong>${businessName}</strong> just submitted a request for a new creative design.`)}
      ${table(
        row('Business Name', businessName) +
        row('Ad Type', adType) +
        row('Contact Phone', contact)
      )}
      <div style="background:#F9F7F5;border:1px solid #E5E7EB;border-radius:10px;padding:16px;margin:16px 0">
        <p style="font-size:12px;color:#9CA3AF;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em;font-weight:700">Ad Brief / Description</p>
        <p style="font-size:14px;color:#374151;margin:0;line-height:1.6">${description}</p>
      </div>
      ${p('Please review this request and contact the client within 24 hours to proceed with the design process.')}
      ${btn('View requests in dashboard', `${process.env.FRONTEND_URL}/admin/requests`)}
    `),
  });
}
