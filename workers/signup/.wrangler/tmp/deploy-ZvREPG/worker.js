var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var MAX_EMAIL_LEN = 254;
function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}
__name(cors, "cors");
function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) }
  });
}
__name(json, "json");
function fail(message, status, origin) {
  return json({ errors: [{ message }] }, status, origin);
}
__name(fail, "fail");
var worker_default = {
  async fetch(request, env) {
    const allowed = env.ALLOW_ORIGIN ?? "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(allowed) });
    }
    if (request.method !== "POST") {
      return fail("Method not allowed.", 405, allowed);
    }
    const origin = request.headers.get("Origin");
    if (origin && allowed && origin !== allowed) {
      return fail("This form cannot be submitted from that origin.", 403, allowed);
    }
    let form;
    try {
      form = await request.formData();
    } catch {
      return fail("Could not read the submission.", 400, allowed);
    }
    if ((form.get("_gotcha") ?? "").toString().trim() !== "") {
      return json({ ok: true }, 200, allowed);
    }
    const email = (form.get("email") ?? "").toString().trim().toLowerCase();
    if (!email) return fail("Please enter an email address.", 422, allowed);
    if (email.length > MAX_EMAIL_LEN) return fail("That email address is too long.", 422, allowed);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail("That doesn't look like a valid email address.", 422, allowed);
    }
    const key = `sub:${email}`;
    try {
      if (await env.SIGNUPS.get(key)) {
        return fail("That address is already subscribed.", 409, allowed);
      }
      await env.SIGNUPS.put(
        key,
        JSON.stringify({
          email,
          at: (/* @__PURE__ */ new Date()).toISOString(),
          // Coarse origin data only - useful for spotting abuse, no fingerprinting.
          country: request.headers.get("CF-IPCountry") ?? null
        })
      );
    } catch (e) {
      console.error("KV write failed", e);
      return fail("Couldn't save that just now. Please try again shortly.", 503, allowed);
    }
    return json({ ok: true }, 200, allowed);
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
