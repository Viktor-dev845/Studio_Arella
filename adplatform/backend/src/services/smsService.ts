export async function sendSms(to: string, message: string) {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || 'N-Alert';

  if (!apiKey) {
    console.warn('⚠️ TERMII_API_KEY not set. Skipping SMS sending.');
    return;
  }

  // Format phone number to international format without '+'
  // Assuming Nigerian numbers for now, e.g., 080... -> 23480...
  let formattedPhone = to.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '234' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('234') && formattedPhone.length === 10) {
    formattedPhone = '234' + formattedPhone;
  }

  try {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        from: senderId,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: apiKey,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Termii Error: ${JSON.stringify(data)}`);
    }

    console.log(`✅ SMS sent successfully to ${formattedPhone}`, data);
    return data;
  } catch (error: any) {
    console.error('❌ Failed to send SMS via Termii:', error.message);
    throw error;
  }
}
