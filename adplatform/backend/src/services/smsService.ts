import https from 'https';

export async function sendSms(to: string, message: string) {
  const apiKey = (process.env.SENDCHAMP_API_KEY || '').replace(/['"]/g, '').trim();
  const senderId = (process.env.SENDCHAMP_SENDER_ID || 'Sendchamp').replace(/['"]/g, '').trim();

  if (!apiKey) {
    console.warn('⚠️ SENDCHAMP_API_KEY not set. Skipping SMS sending.');
    return;
  }

  let formattedPhone = to.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '234' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('234') && formattedPhone.length === 10) {
    formattedPhone = '234' + formattedPhone;
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      to: [formattedPhone],
      message: message,
      sender_name: senderId,
      route: 'dnd'
    });

    const options = {
      hostname: 'api.sendchamp.com',
      path: '/api/v1/sms/send',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode && res.statusCode >= 400 || parsed.status === 'failed' || parsed.status === 'error') {
            reject(new Error(parsed.message || JSON.stringify(parsed)));
          } else {
            console.log(`✅ SMS sent successfully to ${formattedPhone}`, parsed);
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Failed to send SMS via Sendchamp (Network):', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}
