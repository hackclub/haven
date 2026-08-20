import { WebClient } from "@slack/web-api";
import { env } from "./env";

export const slack = new WebClient(env.SLACK_BOT_TOKEN);
