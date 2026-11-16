# Present-Service – secure segment availability API (integration contract)

## Current implementation
The frontend now has a responsive, accessible aggregate count panel in step 1 of the existing audience brief. It is **disabled for actual counts** until an authenticated, rate-limited and legally reviewed backend and real dataset are connected. The public GitHub Pages preview never has access to the family database. No counts are fabricated. The existing example segment figures (18,400 / 7,200 / 54,000) remain clearly fictional and are not used by this feature.

Configure `availabilityEndpoint` in the public `site-config.js` **only after** the API has passed the tests below. This is a public endpoint URL, not a secret. The endpoint must use HTTPS, support `POST` and CORS for the exact approved frontend origin, and reply `Cache-Control: no-store`.

## Request
`POST /availability` JSON (no names, email addresses, contact-level data or user-provided SQL):
```json
{
  "channel": "Direct mail",
  "stage": "0–6 miesięcy",
  "childCount": "2 dzieci",
  "parentAge": "25–34 lata",
  "location": "Wybrane województwa",
  "regions": ["Mazowieckie", "Wielkopolskie"],
  "cities": ""
}
```

The accepted channel and category values must be explicitly allowlisted server-side and mapped to **verified actual fields and eligibility rules** for each distinct source/channel. For the nationwide geography, `regions` and `cities` should be empty. Multi-channel requests must not double-count records; if counts cannot be deduplicated, return a not-available response rather than a misleading number.

## Successful response
```json
{
  "ok": true,
  "type": "aggregate",
  "count": 12654,
  "asOf": "2026-11-16",
  "suppressed": false
}
```
**That example number is a schema illustration only and is NOT a Present-Service count.**

For privacy-sensitive groups, do not return a precise count. Return an aggregate suppression response with `suppressed: true` and an integer `count: 0` (ignored by the frontend). Return errors with non-2xx HTTP codes; never send a fabricated count, raw rows, individual identifiers, household addresses, contact data, database credentials or raw SQL. Define the suppression threshold based on a formal legal/data-protection assessment. Public aggregate queries may still leak information through repeated differencing; consider coarse bands/rounding, minimum group sizes, rate limits, query budgets and abuse controls.

## Operational requirements
1. Validate all values and lengths server-side; restrict region names and city inputs.
2. Enforce the requested marketing channel's data permissions/consent and eligibility before counting. **Matching records are not automatically lawfully contactable records.**
3. Count the correct deduplicated family/household/contact unit for each channel; label what the number means. Do not silently equate emails, households and people.
4. Use indexed server-side queries, parameter binding and a service identity with aggregate-only read permission; keep raw personal data inaccessible to browser clients.
5. Protect against scraping, differencing and enumeration: strict CORS is not authorization; use quotas, anomaly detection, rate limits and a privacy threshold. Prefer approved broad segments over unrestricted free-text filters.
6. Avoid personal information in request logs and telemetry; document retention and purpose of count results. Require privacy/security/legal approval before enabling.
7. Give each response a real source snapshot date in `asOf`; distinguish total match count from available/authorized campaign inventory and potential channel overlap.
8. Test empty, invalid, sparse, multi-region, all-Poland and multi-channel combinations; timeout/failure; comparison with internal reporting; anti-abuse; mobile and accessibility.

## Example frontend switch (only when real API is live)
```js
window.PRESENT_SERVICE_CONFIG = Object.freeze({
  leadEndpoint: "",
  availabilityEndpoint: "https://<approved-aggregate-api-host>/availability",
  turnstileSiteKey: "",
  analyticsWebsiteId: ""
});
```
A real database connection, credentials, data dictionary, availability rules and deployment are **not present in this repository**. Do not enable the switch until these are supplied and validated. Do not use the historic headline volumes as a live count.
