export async function sendSms(to: string, message: string) {
  const apiKey = (process.env.SENDCHAMP_API_KEY || '').replace(/['"]/g, '').trim();
  const senderId = (process.env.SENDCHAMP_SENDER_ID || 'Sendchamp').replace(/['"]/g, '').trim();

  if (!apiKey) {
    console.warn('⚠️ SENDCHAMP_API_KEY not set. Skipping SMS sending.');
    return;
  }

  // Format phone number to international format without '+'
  let formattedPhone = to.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '234' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('234') && formattedPhone.length === 10) {
    formattedPhone = '234' + formattedPhone;
  }

  try {
    const response = await fetch('https://api.sendchamp.com/api/v1/sms/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        to: [formattedPhone],
        message: message,
        sender_name: senderId,
        route: 'dnd'
      }),
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      throw new Error(`Sendchamp Error: ${data.message || JSON.stringify(data)}`);
    }

    console.log(`✅ SMS sent successfully to ${formattedPhone}`, data);
    return data;
  } catch (error: any) {
    console.error('❌ Failed to send SMS via Sendchamp:', error.message);
    throw error;
  }
}
