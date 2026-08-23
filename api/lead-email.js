/**
 * ============================================================================
 *  LEAD EMAIL — notifies by mail whenever a new lead lands
 * ============================================================================
 *  Called by a Supabase Database Webhook on INSERT into `leads`, not by the
 *  visitor's browser. That is the whole point: the browser is handing control
 *  to WhatsApp at exactly that moment and may be suspended mid-request (the
 *  bug that lost leads before this). Firing from the database means the mail
 *  goes out for every row that exists, whatever the visitor's device did next.
 *
 *  ── Configuration (Vercel → Settings → Environment Variables) ─────────────
 *    RESEND_API_KEY       secret key from resend.com
 *    LEAD_EMAIL_FROM      verified sender, e.g. "לידים <leads@michalleviart.com>"
 *    LEAD_EMAIL_TO        recipients, comma-separated
 *    LEAD_WEBHOOK_SECRET  shared secret; the webhook must send it as
 *                         the `x-webhook-secret` header
 *
 *  Recipients live in an env var rather than in this file so adding or
 *  removing someone doesn't need a code change and a deploy.
 * ============================================================================
 */

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);

function buildHtml(lead) {
  const row = (label, value) =>
    value
      ? `<tr>
           <td style="padding:6px 14px 6px 0;color:#8a7f75;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>
           <td style="padding:6px 0;color:#2B2420;font-size:15px">${value}</td>
         </tr>`
      : '';

  const items = Array.isArray(lead.items) ? lead.items : [];
  const itemsHtml = items.length
    ? `<div style="margin-top:22px">
         <p style="margin:0 0 8px;color:#8a7f75;font-size:13px">היצירות שנבחרו</p>
         <ul style="margin:0;padding-right:18px;color:#2B2420;font-size:15px;line-height:1.9">
           ${items
             .map(
               (i) =>
                 `<li>${escapeHtml(i.title)}${
                   i.sizeLabel ? ` — ${escapeHtml(i.sizeLabel)}` : ''
                 }${i.price != null ? ` — ₪${Number(i.price).toLocaleString('he-IL')}` : ''}</li>`
             )
             .join('')}
         </ul>
       </div>`
    : '';

  const phone = escapeHtml(lead.phone);
  const waNumber = String(lead.phone || '').replace(/\D/g, '').replace(/^0/, '972');

  return `<!doctype html>
<html dir="rtl" lang="he">
  <body style="margin:0;background:#F4EFE8;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:560px;margin:0 auto;padding:28px 20px">
      <div style="background:#FFFDFA;border:1px solid #E4DBCF;border-radius:4px;padding:26px">
        <p style="margin:0 0 4px;color:#A65D35;font-size:12px;letter-spacing:.14em">פנייה חדשה מהאתר</p>
        <h1 style="margin:0 0 20px;font-size:22px;font-weight:normal;color:#2B2420">${escapeHtml(lead.name)}</h1>

        <table style="border-collapse:collapse;width:100%">
          ${row('טלפון', `<a href="tel:${phone}" style="color:#A65D35;text-decoration:none" dir="ltr">${phone}</a>`)}
          ${row('אימייל', lead.email ? `<a href="mailto:${escapeHtml(lead.email)}" style="color:#A65D35;text-decoration:none" dir="ltr">${escapeHtml(lead.email)}</a>` : '')}
          ${row('הודעה', escapeHtml(lead.message).replace(/\n/g, '<br>'))}
          ${row('התקבל', new Date(lead.created_at).toLocaleString('he-IL', { dateStyle: 'long', timeStyle: 'short' }))}
        </table>

        ${itemsHtml}

        <div style="margin-top:26px">
          <a href="https://wa.me/${waNumber}"
             style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;
                    padding:11px 22px;border-radius:3px;font-size:14px">מענה בוואטסאפ</a>
          <a href="https://michalleviart.com/#/admin"
             style="display:inline-block;margin-right:8px;border:1px solid #E4DBCF;color:#2B2420;
                    text-decoration:none;padding:11px 22px;border-radius:3px;font-size:14px">פתיחה בממשק</a>
        </div>
      </div>
      <p style="margin:16px 0 0;text-align:center;color:#A6907E;font-size:12px">
        נשלח אוטומטית מהאתר של מיכל לוי
      </p>
    </div>
  </body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  // Without this the endpoint is a public "email anyone" button.
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!secret || req.headers['x-webhook-secret'] !== secret) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const { RESEND_API_KEY, LEAD_EMAIL_FROM, LEAD_EMAIL_TO } = process.env;
  if (!RESEND_API_KEY || !LEAD_EMAIL_FROM || !LEAD_EMAIL_TO) {
    console.error('lead-email: missing configuration');
    return res.status(500).json({ error: 'not configured' });
  }

  const lead = req.body?.record ?? req.body;
  if (!lead?.name || !lead?.phone) {
    return res.status(400).json({ error: 'no lead in payload' });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: LEAD_EMAIL_FROM,
      to: LEAD_EMAIL_TO.split(',').map((s) => s.trim()).filter(Boolean),
      // Replying to the notification reaches the customer, not us.
      reply_to: lead.email || undefined,
      subject: `פנייה חדשה מהאתר — ${lead.name}`,
      html: buildHtml(lead),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('lead-email: resend rejected the send:', response.status, detail);
    // A non-2xx tells Supabase the delivery failed, which surfaces it in the
    // webhook log instead of losing it silently.
    return res.status(502).json({ error: 'send failed', detail });
  }

  return res.status(200).json({ ok: true });
}
