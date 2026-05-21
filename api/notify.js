export default async function handler(req, res) {
  // Only allow POST requests (which Supabase will send)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Grab the payload sent from your Supabase Webhook
    const payload = req.body;
    const record = payload.record; // The new row in your messages table

    if (!record) {
      return res.status(400).json({ error: 'No record found in payload' });
    }

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
        reply_to: record.email, 
        subject: `New Lead: ${record.name}`,
        html: `
          <h2>New Inquiry from Illusive Studio</h2>
          <p><strong>Name:</strong> ${record.name}</p>
          <p><strong>Email:</strong> ${record.email}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${record.message}</p>
        `
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
