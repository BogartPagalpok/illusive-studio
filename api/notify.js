function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  // Only allow POST requests (which Supabase will send)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional webhook secret check if configured in environment
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (webhookSecret && req.headers['x-webhook-secret'] !== webhookSecret) {
    return res.status(401).json({ error: 'Unauthorized webhook request' });
  }

  try {
    // 1. Grab the payload sent from your Supabase Webhook
    const payload = req.body;
    const record = payload?.record; // The new row in your messages table

    if (!record) {
      return res.status(400).json({ error: 'No record found in payload' });
    }

    const safeName = escapeHtml(record.name || 'Anonymous');
    const safeEmail = escapeHtml(record.email || 'No email provided');
    const safeMessage = escapeHtml(record.message || '').replace(/\n/g, '<br />');

    // 2. Send the email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "Illusive Studio <onboarding@resend.dev>", 
        to: "yhanlhester@gmail.com", 
        reply_to: record.email || undefined, 
        subject: `New Lead: ${safeName}`,
        html: `
          <h2>New Inquiry from Illusive Studio</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        `
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
