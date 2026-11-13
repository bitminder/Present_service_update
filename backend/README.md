# Optional B2B lead delivery – Cloudflare Worker

This folder is **not deployed automatically** by GitHub Pages. Version 2.0 works today using an on-device email draft and copyable brief. Direct submission remains **disabled by default** until the following production prerequisites are met.

## Prerequisites

- Company approval for the privacy notice and the actual handling of B2B inquiry data; verify legal basis, retention and the responsible controller.
- Cloudflare account with a Worker and Turnstile widget configured for `bitminder.github.io` (staging). Production must have its real hostname configured.
- Resend account and a **verified sender email domain**. The company's mailbox must be approved as the recipient. Do not send from a fictitious email address.
- Rate limits and abuse protection at the Cloudflare edge; Turnstile verification is implemented server-side, but does not replace appropriate traffic limits.
- Never send sensitive personal records or child-level data to this form. It only collects campaign criteria and the business contact details.

## Example deployment

From the `backend/` directory, after installing the Cloudflare Wrangler CLI:

```sh
wrangler login
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put RESEND_API_KEY
wrangler secret put RESEND_FROM_EMAIL
wrangler secret put RESEND_TO_EMAIL
wrangler deploy
```

In the frontend `site-config.js`, change only public values:

```js
window.PRESENT_SERVICE_CONFIG = Object.freeze({
  leadEndpoint: "https://<YOUR-WORKER-NAME>.<YOUR-SUBDOMAIN>.workers.dev/lead",
  turnstileSiteKey: "<PUBLIC-TURNSTILE-SITE-KEY>",
  analyticsWebsiteId: ""
});
```

The online-send button only appears when an HTTPS endpoint and a Turnstile site key are configured. It additionally requires a valid business contact email and confirmation that the visitor has read the privacy information.

## Security design

The Worker validates input lengths, source Origin, optional bot trap, allowed channel, email format and Turnstile token/hostname. Only then does it send a plain-text inquiry via Resend to the configured mailbox. It never accesses the family database or exposes personal records. The only retained data is whatever the approved mail service and recipient mailbox retain under their actual policies.

A `200 {ok:true}` means the email provider **accepted** the request, not that an employee replied or that delivery to the final inbox has been independently verified. If uncertain, the UI explicitly suggests checking the inbox or using the email fallback. Do not enable until the legal and end-to-end delivery tests have passed.

## Analytics

Optional Umami integration is controlled by `analyticsWebsiteId` in `site-config.js`; empty means off. Configure only after a documented privacy review. Events contain no form fields, names, emails, segment choices or user identifiers.

## Launch checklist

- [ ] Confirm actual addresses, contact person and company claims
- [ ] Approve full legally sufficient privacy notice and retention schedule
- [ ] Verify Resend sender + recipient domains and test inbox delivery
- [ ] Set Turnstile allowed domains and anti-abuse rate limits
- [ ] Test browser/network failures and duplicate submissions
- [ ] Deploy API, update site-config.js, monitor 4xx/5xx without logging PII
- [ ] Only then enable tracking after its own privacy review
