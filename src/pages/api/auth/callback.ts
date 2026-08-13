import type { APIRoute } from "astro";

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

  const profileResp = await fetch("https://auth.hackclub.com/api/v1/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileResp.ok) {
    return new Response("Failed to fetch profile", { status: 502 });
  }

  const profile = await profileResp.json();

  return Response.json(profile);
};
