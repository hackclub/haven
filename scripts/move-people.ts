import { App } from "slack.ts";

const {
  SCRIPT_MAIN_CHANNEL,
  SCRIPT_HELP_CHANNEL,
  SCRIPT_BULLETIN_CHANNEL,
  SCRIPT_SLACK_USER_ID,
} = process.env as {
  SCRIPT_MAIN_CHANNEL: string;
  SCRIPT_HELP_CHANNEL: string;
  SCRIPT_BULLETIN_CHANNEL: string;
  SCRIPT_SLACK_USER_ID: string;
};

const app = new App({ token: process.env.SCRIPT_SLACK_TOKEN! });

const people = (
  await app.channel(SCRIPT_MAIN_CHANNEL).members({
    // @ts-expect-error batch isn't exposed
    batch: 999,
  })
).filter((f) => f.id !== SCRIPT_SLACK_USER_ID);
console.log("people:", people.length);

for (const id of [SCRIPT_HELP_CHANNEL, SCRIPT_BULLETIN_CHANNEL]) {
  await app.channel(id).invite(...people);
}
