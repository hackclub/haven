import type { LayoutServerLoad } from "./$types";
import { env } from "$env/dynamic/private";

/** Referral codes arrive as `?r=` and outlive the landing page they came in on. */
const REFERRAL_COOKIE = "haven_referral";
const REFERRAL_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

/**
 * `$env/dynamic/private` cannot reach the browser bundle — the hero needs the
 * signup URL, and this is how it gets there. It is optional: without it the hero
 * falls back to the organizer signup rather than failing the page render.
 *
 * The referral code is stashed in a cookie on the way through, so someone who
 * lands on `/?r=abc` and then wanders the site still signs up with the code
 * attached.
 */
export const load: LayoutServerLoad = ({ url, cookies }) => {
  const incoming = url.searchParams.get("r");

  if (incoming) {
    cookies.set(REFERRAL_COOKIE, incoming, {
      path: "/",
      maxAge: REFERRAL_MAX_AGE,
      sameSite: "lax",
    });
  }

  return {
    // `RSVP_URL` keeps its old name in the environment; the deployment sets it.
    signupUrl: env.RSVP_URL,
    referral: incoming ?? cookies.get(REFERRAL_COOKIE) ?? null,
  };
};
