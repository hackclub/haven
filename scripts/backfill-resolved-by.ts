import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { App, SlackWebAPIPlatformError } from "slack.ts";
import { ticketsTable } from "../src/lib/server/db/schema";

const db = drizzle(
  required("SCRIPT_DATABASE_URL", process.env.SCRIPT_DATABASE_URL),
);

// The migration that turned `resolved` (boolean) into `resolvedBy` (text) had
// no closer to record, so it stamped every already-closed ticket with this
// placeholder. Those rows are exactly the ones this script fills in.
const PLACEHOLDER = "USLACKBOT";

// The wording the bot has always used when announcing a close, as posted by
// `action:button.close` in src/lib/slack.ts.
const CLOSE_PATTERN = /closed by <@([A-Z0-9]+)>/i;

const apply = process.argv.includes("--apply");

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

const botUserId = required(
  "SCRIPT_SLACK_USER_ID",
  process.env.SCRIPT_SLACK_USER_ID,
);

const app = new App({
  token: required("SCRIPT_SLACK_TOKEN", process.env.SCRIPT_SLACK_TOKEN),
});

const helpChannel = app.channel(
  required("SCRIPT_HELP_CHANNEL", process.env.SCRIPT_HELP_CHANNEL),
);

/** Turns a Slack message timestamp ("1755109123.456789") into a Date. */
function tsToDate(ts: string): Date {
  return new Date(Number(ts.split(".")[0]) * 1000);
}

/**
 * Walks a ticket's thread and returns the newest message posted by the bot
 * user, or undefined if the thread has none (or is gone from Slack).
 */
async function lastBotMessage(threadTs: string) {
  let latest: { ts: string; text: string } | undefined;

  // Replies arrive oldest to newest, so the last match wins.
  for await (const message of helpChannel
    .message(threadTs)
    .replies({ root: false })) {
    if (message.user !== botUserId) continue;
    latest = { ts: message.ts, text: message.text ?? "" };
  }

  return latest;
}

const tickets = await db
  .select()
  .from(ticketsTable)
  .where(eq(ticketsTable.resolvedBy, PLACEHOLDER));

console.log(
  `${tickets.length} ticket(s) to backfill${apply ? "" : " (dry run; pass --apply to write)"}`,
);

let updated = 0;
let skipped = 0;

for (const [index, ticket] of tickets.entries()) {
  const label = `[${index + 1}/${tickets.length}] ${ticket.helpMessageTs}`;

  let message: Awaited<ReturnType<typeof lastBotMessage>>;
  try {
    message = await lastBotMessage(ticket.helpMessageTs);
  } catch (error) {
    // A deleted thread is expected for old tickets; anything else is worth
    // seeing in full, but neither should stop the rest of the backfill.
    if (
      error instanceof SlackWebAPIPlatformError &&
      (error.error === "thread_not_found" ||
        error.error === "message_not_found")
    ) {
      console.log(`${label}: skipped, thread is gone from Slack`);
    } else {
      console.error(`${label}: skipped, failed to fetch the thread:`, error);
    }
    skipped++;
    continue;
  }

  if (!message) {
    console.log(`${label}: skipped, no messages from the bot in the thread`);
    skipped++;
    continue;
  }

  const resolvedBy = CLOSE_PATTERN.exec(message.text)?.[1];
  if (!resolvedBy) {
    console.log(
      `${label}: skipped, last bot message is not a close announcement: ${JSON.stringify(message.text.substring(0, 80))}`,
    );
    skipped++;
    continue;
  }

  // The announcement goes out right after the close, so its timestamp is a
  // far better `resolvedAt` than the epoch the migration wrote.
  const resolvedAt = tsToDate(message.ts);

  if (apply) {
    // Re-check the placeholder in the UPDATE: if the ticket was reopened and
    // closed for real while this script was running, that close is the truth.
    const [result] = await db
      .update(ticketsTable)
      .set({ resolvedBy, resolvedAt })
      .where(
        and(
          eq(ticketsTable.id, ticket.id),
          eq(ticketsTable.resolvedBy, PLACEHOLDER),
        ),
      )
      .returning({ id: ticketsTable.id });

    if (!result) {
      console.log(`${label}: skipped, resolved by someone else mid-run`);
      skipped++;
      continue;
    }
  }

  console.log(
    `${label}: ${apply ? "set" : "would set"} resolvedBy=${resolvedBy} resolvedAt=${resolvedAt.toISOString()}`,
  );
  updated++;
}

console.log(
  `Done: ${updated} ${apply ? "updated" : "matched"}, ${skipped} skipped`,
);

await db.$client.end();
