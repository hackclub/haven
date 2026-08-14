import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { usersTable } from "../../../lib/db/schema";
import { getHCAProfile } from "../../../lib/services/hca";

export const GET: APIRoute = async ({ request }) => {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) return new Response("Invalid code", { status: 400 });

  const redirectUri = `${import.meta.env.EXTERNAL_URL || "https://haven.hackclub.com"}/api/auth/callback`;

  const tokenResp = await fetch("https://auth.hackclub.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: import.meta.env.HCA_CLIENT_ID,
      client_secret: import.meta.env.HCA_CLIENT_SECRET,
      redirect_uri: redirectUri,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResp.ok) {
    return new Response("Failed to exchange code", { status: 502 });
  }

  const tokenData = await tokenResp.json();

  if (!tokenData.access_token) {
    return new Response("Failed to read token", { status: 500 });
  }

  const identity = await getHCAProfile(tokenData.access_token);

  const primaryAddress =
    identity.addresses?.find((address) => address.primary) ??
    identity.addresses?.[0] ??
    null;

  const values = {
    hcaToken: tokenData.access_token,
    hcaId: identity.id,
    firstName: identity.first_name,
    lastName: identity.last_name,
    legalFirstName: identity.legal_first_name,
    legalLastName: identity.legal_last_name,
    primaryEmail: identity.primary_email,
    birthday: identity.birthday,
    phoneNumber: identity.phone_number,
    yswsEligible: identity.ysws_eligible ?? false,
    verificationStatus: identity.verification_status,
    address: primaryAddress,
    slackId: identity.slack_id,
  };

  const [user] = await db
    .insert(usersTable)
    .values(values)
    .onConflictDoUpdate({ target: usersTable.hcaId, set: values })
    .returning({ token: usersTable.token });

  const signupUrl = new URL(import.meta.env.POC_SIGNUP_URL);
  signupUrl.searchParams.set("token", user!.token);

  return Response.redirect(signupUrl);
};
