export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const data = await context.request.json();

    const times = Array.isArray(data.availability) ? data.availability.join(', ') : (data.availability || 'Not specified');
    const planType = Array.isArray(data.planType) ? data.planType.join(', ') : (data.planType || 'Not specified');
    const services = Array.isArray(data.services) ? data.services.join(', ') : (data.services || 'Not specified');

    const text = [
      '\u{1F4C5} New Consultation Request',
      '',
      `\u{1F464} Name: ${data.firstName || ''} ${data.lastName || ''}`,
      `\u{1F4E7} Email: ${data.email || ''}`,
      `\u{1F4F1} Phone: ${data.phone || ''}`,
      '',
      `\u{1F4CD} Address:`,
      `${data.street || ''}`,
      data.street2 ? data.street2 : '',
      `${data.city || ''}, ${data.state || ''} ${data.zip || ''}`,
      '',
      `\u{1F550} Available: ${times}`,
      `\u{1F465} Plan Type: ${planType}`,
      `\u{1F4CB} Services: ${services}`,
      data.otherText ? `\u{270F}\u{FE0F} Other: ${data.otherText}` : '',
      '',
      `\u{1F4DD} Notes:`,
      data.notes || 'None',
    ].filter(line => line !== '').join('\n');

    const telegramUrl = `https://api.telegram.org/bot${context.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const chatIds = context.env.TELEGRAM_CHAT_IDS.split(',');

    const results = await Promise.all(chatIds.map(id =>
      fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: id.trim(), text: text }),
      })
    ));

    const failed = results.filter(r => !r.ok);
    if (failed.length === results.length) {
      return new Response(JSON.stringify({ success: false, error: 'All messages failed' }), { status: 502, headers });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
