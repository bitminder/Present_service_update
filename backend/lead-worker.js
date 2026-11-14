/* Cloudflare Workers: optional B2B lead delivery for Present-Service.
   Requires a VERIFIED sender, Resend API key, Turnstile secret and legal approval.
   Does not read, expose, query or transfer the family's marketing database.
*/
const MAX_BODY_LENGTH = 12000;
const FIELDS = {
  brand: 120, channel: 80, cooperationModel: 120, requestedVolume: 50, stage: 80, childCount: 50,
  parentAge: 50, territory: 340, campaignDate: 20,
  budget: 80, goal: 1200, contactName: 120, contactEmail: 254
};
const CHANNELS = new Set([
  "Direct mail", "E-mailing", "Mobile marketing", "Sampling / Mamaklub",
  "Kampania wielokanałowa", "Potrzebuję doradztwa"
]);

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };
}
function response(data, code, origin) {
  return new Response(JSON.stringify(data), {
    status: code, headers: { ...corsHeaders(origin), "Content-Type": "application/json;charset=UTF-8" }
  });
}
function safeString(value, max) {
  if (typeof value !== "string" || value.length > max) return null;
  // Normalize control characters; keep newline only in campaign goal.
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
}
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    const origin = request.headers.get("Origin") || "";
    if (path !== "/lead") return new Response("Not found", { status: 404 });
    if (!env.ALLOWED_ORIGIN || origin !== env.ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") return response({ ok: false }, 405, origin);
    if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.RESEND_TO_EMAIL) {
      return response({ ok: false }, 503, origin);
    }
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return response({ ok: false }, 415, origin);
    }
    if (Number(request.headers.get("content-length") || 0) > MAX_BODY_LENGTH) {
      return response({ ok: false }, 413, origin);
    }
    let body;
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY_LENGTH) return response({ ok: false }, 413, origin);
      body = JSON.parse(raw);
      if (!body || Array.isArray(body) || typeof body !== "object") throw new Error("body");
    } catch {
      return response({ ok: false }, 400, origin);
    }
    // Extra bot trap; never log the request contents.
    if (body.website) return response({ ok: true }, 200, origin);
    if (body.privacyConfirmed !== true || typeof body.challengeToken !== "string"
        || body.challengeToken.length < 10 || body.challengeToken.length > 2048) {
      return response({ ok: false }, 400, origin);
    }
    const fields = {};
    for (const [key, limit] of Object.entries(FIELDS)) {
      const value = safeString(body[key], limit);
      if (value === null) return response({ ok: false }, 400, origin);
      fields[key] = value;
    }
    if (!CHANNELS.has(fields.channel) || !fields.territory ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.contactEmail)) {
      return response({ ok: false }, 400, origin);
    }

    try {
      const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: body.challengeToken
        })
      });
      if (!check.ok) return response({ ok: false }, 503, origin);
      const verify = await check.json();
      if (verify.success !== true
        || !verify.hostname
        || verify.hostname !== (env.TURNSTILE_EXPECTED_HOSTNAME || new URL(origin).hostname)) {
        return response({ ok: false }, 403, origin);
      }

      const message = [
        "NOWE ZAPYTANIE O DANE — PRESENT-SERVICE",
        "",
        ...Object.entries({
          "Firma": fields.brand, "Kontakt": fields.contactName,
          "E-mail": fields.contactEmail, "Kanał": fields.channel,
          "Planowany model użycia danych": fields.cooperationModel,
          "Oczekiwana liczba kontaktów": fields.requestedVolume,
          "Wiek dziecka": fields.stage, "Liczba dzieci": fields.childCount,
          "Wiek matki": fields.parentAge, "Region": fields.territory,
          "Termin": fields.campaignDate, "Budżet": fields.budget,
          "Cel": fields.goal
        }).map(([name, value]) => name + ": " + (value || "do ustalenia")),
        "",
        "Zapytanie o dane do kampanii firmy, po potwierdzeniu zapoznania się z informacją o danych.",
        "Sprawdź dostępność, zakres i uprawnienia oraz możliwość przekazania lub wykorzystania danych przed ofertą."
      ].join("\n");

      const sent = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + env.RESEND_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: env.RESEND_FROM_EMAIL,
          to: [env.RESEND_TO_EMAIL],
          reply_to: fields.contactEmail,
          subject: "Zapytanie o dane Present-Service: " + fields.channel,
          text: message
        })
      });
      if (!sent.ok) return response({ ok: false }, 502, origin);
      return response({ ok: true }, 200, origin);
    } catch {
      return response({ ok: false }, 502, origin);
    }
  }
};
