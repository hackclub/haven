import type { APIRoute } from "astro";
import { EXTERNAL_URL } from "../../../lib/consts";
import { env } from "../../../lib/env";
import { slack } from "../../../lib/slack";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (!email) {
    return new Response("Invalid parameters", { status: 400 });
  }

  if (env.SLACK_BOT_TOKEN && env.SLACK_MAIN_CHANNEL) {
    try {
      const { user } = await slack.users.lookupByEmail({ email });
      if (user) {
        await slack.conversations.invite({
          channel: env.SLACK_MAIN_CHANNEL,
          users: user.id!,
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (!message.includes("already_in_channel")) {
        console.error("Failed to invite user to slack: " + message);
      }
    }
  }

  const authUrl = new URL(
    "https://auth.hackclub.com/oauth/authorize?response_type=code&scope=name+birthdate+address+verification_status+basic_info+legal_name",
  );
  authUrl.searchParams.set("client_id", env.HCA_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", `${EXTERNAL_URL}/api/auth/callback`);
  authUrl.searchParams.set("login_hint", email);
  return Response.redirect(authUrl);
};
