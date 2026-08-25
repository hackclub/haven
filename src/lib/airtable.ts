import { createHash, timingSafeEqual } from "crypto";
import { env } from "./env";

/**
 * Airtable automations cannot sign a request the way Slack does, so the shared
 * secret in `AIRTABLE_SECRET_KEY` is the whole proof of identity. Compare the
 * digests rather than the strings: `timingSafeEqual` throws on a length
 * mismatch, and hashing first keeps both sides the same size without leaking
 * the length of the real key.
 */
function matchesSecret(presented: string): boolean {
  const digest = (value: string) =>
    createHash("sha256").update(value, "utf8").digest();

  return timingSafeEqual(digest(presented), digest(env.AIRTABLE_SECRET_KEY));
}

/**
 * The bearer token on an incoming Airtable request, from either the standard
 * `Authorization` header or `x-airtable-secret` — Airtable's own scripting
 * environment sets `Authorization` freely, but some connectors reserve it.
 */
function presentedSecret(request: Request): string | null {
  const authorization = request.headers.get("authorization")?.trim();
  if (authorization) {
    const [scheme, ...rest] = authorization.split(/\s+/);
    if (scheme?.toLowerCase() !== "bearer") return null;
    return rest.join(" ") || null;
  }

  return request.headers.get("x-airtable-secret")?.trim() || null;
}

/**
 * Guard for `/api/airtable/` routes, which the middleware exempts from the
 * same-origin check. Returns a 401 to send back, or `null` when the caller
 * proved itself and the request may proceed.
 */
export function checkAirtableAuth(request: Request): Response | null {
  const presented = presentedSecret(request);

  if (!presented || !matchesSecret(presented)) {
    return Response.json(
      { success: false, message: "Invalid or missing Airtable secret key" },
      { status: 401 },
    );
  }

  return null;
}
