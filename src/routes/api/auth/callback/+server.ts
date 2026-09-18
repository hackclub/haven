import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { usersTable } from "$lib/server/db/schema";
import { getHCAProfile } from "$lib/server/services/hca";
import { EXTERNAL_URL } from "$lib/consts";
import { env } from "$env/dynamic/private";

export const GET: RequestHandler = async ({ request }) => {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) return new Response("Invalid code", { status: 400 });

  if (!env.HCA_CLIENT_ID) throw new Error("HCA_CLIENT_ID is not set");
  if (!env.HCA_CLIENT_SECRET) throw new Error("HCA_CLIENT_SECRET is not set");
  if (!env.POC_SIGNUP_URL) throw new Error("POC_SIGNUP_URL is not set");

  const redirectUri = `${EXTERNAL_URL}/api/auth/callback`;

  const tokenResp = await fetch("https://auth.hackclub.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.HCA_CLIENT_ID,
      client_secret: env.HCA_CLIENT_SECRET,
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

  const signupUrl = new URL(env.POC_SIGNUP_URL);
  signupUrl.searchParams.set("token", user!.token);

  return Response.redirect(signupUrl);
};
