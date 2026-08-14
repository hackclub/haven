import type { APIRoute } from "astro";
import { EXTERNAL_URL } from "../../../lib/consts";
import { env } from "../../../lib/env";

export const GET: APIRoute = ({ request }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (!email) {
    return new Response("Invalid parameters", { status: 400 });
  }

  const authUrl = new URL(
    "https://auth.hackclub.com/oauth/authorize?response_type=code&scope=name+birthdate+address+verification_status+basic_info+legal_name",
  );
  authUrl.searchParams.set("client_id", env.HCA_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", `${EXTERNAL_URL}/api/auth/callback`);
  authUrl.searchParams.set("login_hint", email);
  return Response.redirect(authUrl);
};
