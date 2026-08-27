/* Newsletter signup endpoint for PeptideChecker.

   The site is a static export on GitHub Pages, so there is no server to receive the form.
   This Worker is that server. It exists so signups land in storage Kevin owns rather than a
   third-party form service, with no monthly submission cap.

   Deliberately returns Formspree's response shape - { errors: [{ message }] } on failure -
   because the front end was already written and tested against that contract. Matching it
   here means the client needs no special case and can be repointed at either service.

   Bindings required:
     SIGNUPS  - KV namespace, stores one entry per address

   Env vars:
     ALLOW_ORIGIN - the exact site origin permitted to POST here. Not "*", so a random page
                    cannot use this endpoint as its own mailing list. */

const MAX_EMAIL_LEN = 254; // RFC 5321 limit; anything longer is not a real address

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}

function fail(message, status, origin) {
  return json({ errors: [{ message }] }, status, origin);
}

export default {
  async fetch(request, env) {
    const allowed = env.ALLOW_ORIGIN ?? "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(allowed) });
    }
    if (request.method !== "POST") {
      return fail("Method not allowed.", 405, allowed);
    }

    // Reject cross-site posts outright. Browsers already refuse to hand the response to a
    // disallowed origin, but that happens after the write - checking here means an
    // unauthorised page cannot fill the list even though it never sees the reply.
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

    // Honeypot: a real person never sees this field, so anything in it is a bot. Answer 200
    // so the bot believes it succeeded and does not retry, but store nothing.
    if ((form.get("_gotcha") ?? "").toString().trim() !== "") {
      return json({ ok: true }, 200, allowed);
    }

    const email = (form.get("email") ?? "").toString().trim().toLowerCase();
    if (!email) return fail("Please enter an email address.", 422, allowed);
    if (email.length > MAX_EMAIL_LEN) return fail("That email address is too long.", 422, allowed);
    // Deliberately loose: one @, no spaces, a dot in the domain. Strict regexes reject valid
    // addresses, and the confirmation email is the real proof of deliverability.
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
          at: new Date().toISOString(),
          // Coarse origin data only - useful for spotting abuse, no fingerprinting.
          country: request.headers.get("CF-IPCountry") ?? null,
        })
      );
    } catch (e) {
      // Never report success on a failed write. The whole point of this endpoint is that a
      // person who is told they subscribed actually did.
      console.error("KV write failed", e);
      return fail("Couldn't save that just now. Please try again shortly.", 503, allowed);
    }

    return json({ ok: true }, 200, allowed);
  },
};
