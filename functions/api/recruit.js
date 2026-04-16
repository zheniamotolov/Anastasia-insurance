export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const data = await context.request.json();

    const times = Array.isArray(data.availability) ? data.availability.join(', ') : (data.availability || 'Not specified');

    const text = [
      '\u{1F4CB} New Recruit Application',
      '',
      `\u{1F464} Name: ${data.firstName || ''} ${data.lastName || ''}`,
      `\u{1F4E7} Email: ${data.email || ''}`,
      `\u{1F4F1} Phone: ${data.phone || ''}`,
      '',
      `\u{1F4CD} Address:`,
      `${data.street || ''}`,
      `${data.city || ''}, ${data.state || ''} ${data.zip || ''}`,
      '',
      `\u{1F4F8} Instagram: ${data.instagram ? '@' + data.instagram : 'Not provided'}`,
      '',
      `\u{1F550} Available: ${times}`,
      '',
      `\u{1F4DD} Notes:`,
      data.notes || 'None',
    ].join('\n');

    const telegramUrl = `https://api.telegram.org/bot${context.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const tgResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: context.env.TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    if (!tgResponse.ok) {
      const err = await tgResponse.text();
      return new Response(JSON.stringify({ success: false, error: err }), { status: 502, headers });
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

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Come Work With Me</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #111827; }
    main { max-width: 760px; margin: 0 auto; padding: 40px 24px; }
    h1 { font-size: 2.5rem; margin-bottom: 12px; }
    p { color: #4b5563; margin-bottom: 28px; line-height: 1.75; }
    form { background: white; border: 1px solid #e5e7eb; border-radius: 24px; padding: 32px; box-shadow: 0 20px 50px rgba(15,23,42,0.08); }
    label { display: block; margin-bottom: 8px; font-weight: 600; color: #111827; }
    input, select, textarea { width: 100%; padding: 14px 16px; border: 1px solid #d1d5db; border-radius: 14px; margin-bottom: 18px; font-size: 1rem; color: #111827; }
    textarea { min-height: 120px; resize: vertical; }
    .grid { display: grid; gap: 16px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid .full { grid-column: 1 / -1; }
    .submit { display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 16px; background: #2563eb; color: white; font-weight: 700; border: none; border-radius: 14px; cursor: pointer; transition: background 0.2s ease; }
    .submit:hover { background: #1d4ed8; }
    .success { display: none; margin-top: 24px; padding: 24px; border-radius: 18px; background: #ecfdf5; color: #065f46; }
    .success.show { display: block; }
    @media (max-width: 680px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <h1>Come Work With Me</h1>
    <p>Join a team that invests in your growth. Get licensed, get trained, and build a career in finance — on your schedule.</p>

    <form id="recruitForm">
      <div class="grid">
        <div>
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" required>
        </div>
        <div>
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" required>
        </div>
      </div>

      <div class="grid">
        <div>
          <label for="email">Email</label>
          <input type="email" id="email" required>
        </div>
        <div>
          <label for="phone">Phone</label>
          <input type="tel" id="phone" required>
        </div>
      </div>

      <div>
        <label for="street">Street Address</label>
        <input type="text" id="street" required>
      </div>

      <div class="grid">
        <div>
          <label for="city">City</label>
          <input type="text" id="city" required>
        </div>
        <div>
          <label for="state">State</label>
          <select id="state" required>
            <option value="">Select state</option>
            <option>California</option>
            <option>Texas</option>
            <option>New York</option>
            <option>Florida</option>
            <option>Illinois</option>
            <option>Georgia</option>
          </select>
        </div>
      </div>

      <div class="grid">
        <div>
          <label for="zip">Zip Code</label>
          <input type="text" id="zip" required>
        </div>
        <div>
          <label for="instagram">Instagram</label>
          <input type="text" id="instagram" placeholder="yourhandle">
        </div>
      </div>

      <div>
        <label>Best Time to Meet</label>
        <div style="display:grid;gap:10px;">
          <label><input type="checkbox" name="meetingTime" value="morning"> Morning (9–12pm)</label>
          <label><input type="checkbox" name="meetingTime" value="afternoon"> Afternoon (12–3:30pm)</label>
          <label><input type="checkbox" name="meetingTime" value="evening"> Evening (after 5pm)</label>
          <label><input type="checkbox" name="meetingTime" value="weekend"> Weekends</label>
        </div>
      </div>

      <div>
        <label for="notes">Anything you'd like us to know?</label>
        <textarea id="notes"></textarea>
      </div>

      <button type="submit" class="submit">Submit Application</button>
    </form>

    <div id="successMessage" class="success">
      <strong>You're In!</strong>
      <p>Thanks for your interest. We'll reach out soon to schedule your meeting.</p>
    </div>
  </main>

  <script>
    document.getElementById('recruitForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var form = e.target;
      var button = form.querySelector('.submit');
      button.disabled = true;
      button.textContent = 'Sending...';

      var availability = Array.from(form.querySelectorAll('input[name="meetingTime"]:checked')).map(function (cb) {
        return cb.value;
      });

      var data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
        instagram: document.getElementById('instagram').value,
        availability: availability,
        notes: document.getElementById('notes').value,
      };

      try {
        var res = await fetch('/api/recruit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error('Server error');

        form.style.display = 'none';
        document.getElementById('successMessage').classList.add('show');
      } catch (err) {
        alert('Something went wrong. Please try again.');
        button.disabled = false;
        button.textContent = 'Submit Application';
      }
    });
  </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return onRequestOptions();
    }

    if (request.method === 'POST' && url.pathname === '/api/recruit') {
      return onRequestPost({ request, env, ctx });
    }

    if (request.method === 'GET') {
      return new Response(INDEX_HTML, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    return new Response('Method Not Allowed', { status: 405 });
  },
};
