import type { RequestHandler } from "./$types";
import { SlackWebAPIPlatformError } from "slack.ts";
import { EXTERNAL_URL } from "$lib/consts";
import { env } from "$env/dynamic/private";
import { app } from "$lib/slack";

export const GET: RequestHandler = async ({ request }) => {
  const url = new URL(request.url);
  // Optional: the hero only knows an address when the visitor typed one into
  // the signup box first, and organizing should not require that.
  const email = url.searchParams.get("email");

  // if (email && env.SLACK_BOT_TOKEN && env.SLACK_MAIN_CHANNEL) {
  //   try {
  //     // `users.lookupByEmail` has no typings in slack.ts yet, so this falls
  //     // through to the untyped `request` overload.
  //     const { user } = (await app.request("users.lookupByEmail", {
  //       email,
  //     })) as { user?: { id?: string } };
  //     if (user?.id) {
  //       await app.channel(env.SLACK_MAIN_CHANNEL).invite(user.id);
  //     }
  //   } catch (e) {
  //     const code = e instanceof SlackWebAPIPlatformError ? e.error : null;
  //     if (code !== "already_in_channel") {
  //       const message = e instanceof Error ? e.message : String(e);
  //       console.error("Failed to invite user to slack: " + message);
  //     }
  //   }
  // }

  if (!env.HCA_CLIENT_ID) throw new Error("HCA_CLIENT_ID is not set");

  const authUrl = new URL(
    "https://auth.hackclub.com/oauth/authorize?response_type=code&scope=name+birthdate+address+verification_status+basic_info+legal_name",
  );
  authUrl.searchParams.set("client_id", env.HCA_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", `${EXTERNAL_URL}/api/auth/callback`);
  if (email) authUrl.searchParams.set("login_hint", email);
  return Response.redirect(authUrl);
};
