// Vercel Serverless Function — sends the lead-form submission by email.
// Uses your own Gmail account via SMTP (nodemailer), authenticated with a
// Gmail "App Password". No third-party form service is involved.
//
// Required Vercel environment variables (Project Settings -> Environment Variables):
//   GMAIL_USER          -> Avenzaelectrical@gmail.com
//   GMAIL_APP_PASSWORD  -> the 16-character App Password (NOT your normal Gmail password)
//
// See README-EMAIL-SETUP.md for how to generate the App Password.

const nodemailer = require('nodemailer');

const BUSINESS_EMAIL = 'Avenzaelectrical@gmail.com';
const BRAND = {
  name: 'Avenza Electrical',
  gold: '#cf9a44',
  goldDark: '#a87a2e',
  charcoal: '#121316',
  charcoal2: '#1a1c20',
  slate: '#3d4c58',
  silverBright: '#eef0f2',
  textDim: '#9aa1a8',
  black: '#0a0a0b',
  phone: '+1 289-994-9191',
};

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function emailShell(bodyHtml, preheader) {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.black};font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader || '')}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.black};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:${BRAND.charcoal};border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,${BRAND.slate},${BRAND.charcoal2});padding:28px 32px;text-align:center;border-bottom:2px solid ${BRAND.gold};">
            <div style="font-size:20px;letter-spacing:2px;color:${BRAND.silverBright};font-weight:bold;">AVENZA <span style="color:${BRAND.gold};">ELECTRICAL</span></div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;color:${BRAND.silverBright};">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
            <p style="margin:0;color:${BRAND.textDim};font-size:12px;">
              ${BRAND.name} &middot; ${BRAND.phone} &middot; ${escapeHtml(BUSINESS_EMAIL)}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function businessEmailHtml(data) {
  const rows = [
    ['Name', data.name],
    ['Phone', data.phone],
    ['Email', data.email || 'Not provided'],
    ['Service Needed', data.service || 'Not specified'],
  ].map(([label, value]) => `
    <tr>
      <td style="padding:8px 0;color:${BRAND.textDim};font-size:13px;width:140px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:${BRAND.silverBright};font-size:14px;font-weight:bold;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`).join('');

  const body = `
    <h1 style="margin:0 0 6px;font-size:20px;color:${BRAND.silverBright};">New Quote Request</h1>
    <p style="margin:0 0 24px;color:${BRAND.textDim};font-size:14px;">A visitor submitted the lead form on your website.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    <div style="margin-top:20px;padding:16px;background:${BRAND.charcoal2};border-radius:8px;border:1px solid rgba(255,255,255,0.08);">
      <p style="margin:0 0 6px;color:${BRAND.textDim};font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</p>
      <p style="margin:0;color:${BRAND.silverBright};font-size:14px;white-space:pre-wrap;">${escapeHtml(data.message || '(none)')}</p>
    </div>
    <p style="margin:24px 0 0;color:${BRAND.textDim};font-size:12px;">Reply directly to this email to respond to the customer${data.email ? '' : ' (no email was provided — call them instead)'}.</p>
  `;
  return emailShell(body, `New quote request from ${data.name}`);
}

function visitorEmailHtml(data) {
  const body = `
    <h1 style="margin:0 0 6px;font-size:20px;color:${BRAND.silverBright};">Thanks, ${escapeHtml(data.name)}!</h1>
    <p style="margin:0 0 20px;color:${BRAND.textDim};font-size:14px;line-height:1.6;">
      We've received your request and a member of our team will be in touch shortly to follow up.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.charcoal2};border-radius:8px;border:1px solid rgba(255,255,255,0.08);">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 4px;color:${BRAND.textDim};font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Request</p>
        <p style="margin:0;color:${BRAND.silverBright};font-size:14px;"><strong>Service:</strong> ${escapeHtml(data.service || 'Not specified')}</p>
        ${data.message ? `<p style="margin:8px 0 0;color:${BRAND.silverBright};font-size:14px;white-space:pre-wrap;"><strong>Message:</strong> ${escapeHtml(data.message)}</p>` : ''}
      </td></tr>
    </table>
    <p style="margin:24px 0 0;color:${BRAND.textDim};font-size:14px;line-height:1.6;">
      Need us sooner? Call <a href="tel:+12899949191" style="color:${BRAND.gold};text-decoration:none;font-weight:bold;">${BRAND.phone}</a> anytime.
    </p>
  `;
  return emailShell(body, 'We received your request — Avenza Electrical');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, phone, email, service, message } = req.body || {};

  if (!name || !phone) {
    res.status(400).json({ error: 'Name and phone are required.' });
    return;
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    res.status(500).json({ error: 'Email is not configured on the server yet.' });
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  const data = { name, phone, email, service, message };

  try {
    // Notify the business
    await transporter.sendMail({
      from: `"Avenza Electrical Website" <${gmailUser}>`,
      to: BUSINESS_EMAIL,
      replyTo: email || undefined,
      subject: `New Quote Request from ${name}`,
      html: businessEmailHtml(data),
    });

    // Confirm to the visitor, only if they gave an email (it's optional on the form)
    if (email) {
      await transporter.sendMail({
        from: `"Avenza Electrical" <${gmailUser}>`,
        to: email,
        subject: 'We received your request — Avenza Electrical',
        html: visitorEmailHtml(data),
      });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('send-lead error:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
};
