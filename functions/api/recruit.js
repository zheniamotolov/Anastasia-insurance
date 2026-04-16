export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const data = await context.request.json();

    const text = [
      '\u{1F4CB} New Recruit Application',
      '',
      `\u{1F464} Name: ${data.firstName || ''} ${data.lastName || ''}`,
      `\u{1F4E7} Email: ${data.email || ''}`,
      `\u{1F4F1} Phone: ${data.phone || ''}`,
      '',
      `\u{1F4CD} Location: ${data.city || ''}, ${data.state || ''}`,
      '',
      `\u{1F4F8} Instagram: ${data.instagram ? '@' + data.instagram : 'Not provided'}`,
      '',
      `\u{1F4DD} Notes:`,
      data.notes || 'None',
    ].join('\n');

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
