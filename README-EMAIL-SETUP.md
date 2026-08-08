# Email Setup for the Contact Form

The contact form on every page now sends real email automatically through a
Vercel serverless function (`/api/send-lead.js`), using your own Gmail
account — **Avenzaelectrical@gmail.com** — no third-party form service.

When someone submits the form:
1. **You** get an email at Avenzaelectrical@gmail.com with their details (reply-to is set to their email, so you can hit "Reply" directly).
2. **They** get a branded confirmation email — but only if they filled in the optional Email field (it's the only way to reach them by email).

## 1. Generate a Gmail App Password

Gmail won't accept your normal account password for this — you need an
"App Password" (a 16-character code just for this use).

1. Go to your Google Account: https://myaccount.google.com/security
2. Turn on **2-Step Verification** if it isn't already on (required for App Passwords).
3. Go to https://myaccount.google.com/apppasswords
4. Create a new App Password — name it something like "Avenza Website".
5. Copy the 16-character password it gives you (spaces don't matter).

## 2. Add environment variables in Vercel

In your Vercel project: **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `GMAIL_USER` | `Avenzaelectrical@gmail.com` |
| `GMAIL_APP_PASSWORD` | the 16-character App Password from step 1 |

Apply them to **Production** (and Preview if you want form testing on preview deployments too).

## 3. Redeploy

Environment variable changes only take effect on the next deployment —
trigger a redeploy in Vercel after adding them.

## 4. Test it

Submit the form on the live site with your own email in the optional
Email field. You should get:
- The business notification at Avenzaelectrical@gmail.com
- A confirmation email at the address you entered

If the request to `/api/send-lead` fails for any reason (e.g. env vars not
set yet), the form automatically falls back to opening a pre-filled
`mailto:` draft so a submission is never silently lost — but the automated
dual-email flow above only runs once the environment variables are set.

## Files involved
- `api/send-lead.js` — the serverless function, branded HTML emails included
- `js/main.js` — the `fetch('/api/send-lead', ...)` call in the form handler
- `package.json` — declares the `nodemailer` dependency Vercel installs on deploy
