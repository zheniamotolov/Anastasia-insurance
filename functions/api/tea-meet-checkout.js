export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const data = await context.request.json();
    const { email, firstName, lastName } = data;

    const origin = new URL(context.request.url).origin;

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${origin}/tea-meet.html?success=1`);
    params.append('cancel_url', `${origin}/tea-meet.html?canceled=1`);
    params.append('customer_email', email);
    params.append('line_items[0][price]', context.env.STRIPE_PRICE_ID);
    params.append('line_items[0][quantity]', '1');
    params.append('metadata[firstName]', firstName || '');
    params.append('metadata[lastName]', lastName || '');

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ success: false, error: session.error?.message || 'Stripe error' }), { status: 502, headers });
    }

    return new Response(JSON.stringify({ success: true, url: session.url }), { status: 200, headers });
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
