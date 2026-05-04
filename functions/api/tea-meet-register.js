export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const data = await context.request.json();

    const interests = Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || 'Not specified');

    const text = [
      '🍵 New Tea Meeting Registration',
      '',
      `👤 Name: ${data.firstName || ''} ${data.lastName || ''}`,
      `📧 Email: ${data.email || ''}`,
      `📱 Phone: ${data.phone || ''}`,
      '',
      `👶 Has children: ${data.hasChildren || 'Not specified'}`,
      `📋 Interests: ${interests}`,
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
