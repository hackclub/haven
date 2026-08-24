import { EXTERNAL_URL } from "./consts";

// Methods a cross-site form cannot use to change state, so they need no guard.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Origins we treat as our own. The request URL covers local dev and any host
 * the server is reached at directly; EXTERNAL_URL covers production, where a
 * TLS-terminating proxy hands us an internal `http://` URL that would never
 * match the `https://` origin the browser sends.
 */
function allowedOrigins(request: Request, url: URL): string[] {
  const origins = [url.origin];

  // Behind a tunnel or load balancer the edge speaks https while we see http,
  // so `url.origin` alone would reject our own forms. Trusting the forwarded
  // scheme is safe: the host still has to match, so it can only relax the
  // scheme comparison, never let a different site through.
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (proto) origins.push(`${proto}://${url.host}`);

  try {
    origins.push(new URL(EXTERNAL_URL).origin);
  } catch {
    // A malformed EXTERNAL_URL should not take same-origin requests down with
    // it — the request URL origin still lets the site work.
  }
  return origins;
}

function isSameOrigin(request: Request, url: URL): boolean {
  const allowed = allowedOrigins(request, url);

  const origin = request.headers.get("origin");
  if (origin) return allowed.includes(origin);

  // Browsers send `Origin` on every state-changing request, but privacy
  // extensions and some proxies strip it. `Referer` carries the same
  // information (a cross-site form's referer is the attacker's page), so fall
  // back to it rather than rejecting a legitimate submission.
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return allowed.includes(new URL(referer).origin);
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Our replacement for Astro's `security.checkOrigin` (disabled in
 * astro.config.mjs — see the comment there). Returns a 403 to send back, or
 * `null` when the request may proceed.
 *
 * Deliberately stricter than Astro's version in one way: it checks every
 * unsafe method regardless of content type, not just form-like bodies. Every
 * browser-driven write on this site is same-origin, and the routes that are
 * legitimately called from elsewhere are exempted by path in
 * src/middleware.ts rather than by guessing from a `Content-Type`.
 */
export function checkCsrf(request: Request, url: URL): Response | null {
  if (SAFE_METHODS.has(request.method)) return null;
  if (isSameOrigin(request, url)) return null;

  return new Response(`Cross-site ${request.method} requests are forbidden`, {
    status: 403,
  });
}
