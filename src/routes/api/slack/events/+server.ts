import type { RequestHandler } from "./$types";
import { app } from "$lib/slack";

/**
 * Single entry point for Slack events, interactivity and slash commands. The
 * fetch receiver does the whole job: verifies the signature, answers the
 * `url_verification` challenge, dispatches to handlers registered on `app`,
 * and returns the response Slack expects.
 */
export const POST: RequestHandler = ({ request }) => app.receiver.fetch(request);
