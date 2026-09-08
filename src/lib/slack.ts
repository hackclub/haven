import { randomBytes } from "crypto";
import {
  actions,
  App,
  blocks,
  button,
  header,
  R,
  richText,
  section,
  SlackWebAPIPlatformError,
} from "slack.ts";
import { env } from "./env";
import { db } from "./db";
import { ticketsTable, ticketSummariesTable } from "./db/schema";
import { and, asc, desc, eq, isNotNull, isNull } from "drizzle-orm";

export const app = new App({
  token: env.SLACK_BOT_TOKEN,
  receiver: {
    type: "fetch",
    // Fail closed when the secret is missing: a random key makes every
    // signature mismatch, rather than letting anyone who notices the gap
    // sign requests with a known-empty secret.
    signingSecret: env.SLACK_SIGNING_SECRET ?? randomBytes(32).toString("hex"),
    // The receiver dispatches handlers without awaiting them. Without this,
    // a throwing handler is an unhandled rejection that takes the server down.
    waitUntil: (promise) =>
      promise.catch((error: unknown) => {
        console.error("Slack handler failed:", error);
      }),
  },
});

/**
 * Runs a cosmetic Slack call, logging rather than throwing if it fails.
 */
function report<T>(what: string, promise: Promise<T>) {
  return promise.catch((error: unknown) => {
    console.error(`Failed to ${what}:`, error);
  });
}

if (env.SLACK_HELP_CHANNEL) {
  app.on(`message#${env.SLACK_HELP_CHANNEL}`, async (event) => {
    if (event.user === env.SLACK_BOT_USER_ID) return;
    if (event.subtype && (event.subtype as string) !== "file_shared") return;

    if (event.thread_ts) {
      const [ticket] = await db
        .select()
        .from(ticketsTable)
        .where(eq(ticketsTable.helpMessageTs, event.thread_ts));

      if (!ticket) return;
      if (ticket.resolvedBy && event.user !== ticket.openedBy) return;

      const [reopened] = await db
        .update(ticketsTable)
        .set({
          resolvedBy: null,
          resolvedAt: null,
          latestMessageAt: new Date(),
        })
        .where(
          and(
            eq(ticketsTable.id, ticket.id),
            isNotNull(ticketsTable.resolvedBy),
          ),
        )
        .returning({ id: ticketsTable.id });

      if (!reopened) {
        await db
          .update(ticketsTable)
          .set({ latestMessageAt: new Date() })
          .where(eq(ticketsTable.id, ticket.id));
        return;
      }

      queueResendTicketsMessage();

      await Promise.all([
        report(
          "announce a reopened ticket",
          event.reply(
            "This ticket has been reopened. A staff member will help you soon!",
          ),
        ),
        report(
          "restore the hourglass reaction",
          event.channel.message(event.thread_ts).react("hourglass"),
        ),
      ]);
    } else {
      const text =
        "Hi there! A staff member will help you soon. In the meantime, take a look at https://haven.hackclub.com/#faq to see if your question is answered!";
      const message = await event.reply({
        text,
        blocks: blocks(
          section(text),
          actions(button("Close ticket").id("close").style("primary")),
        ),
        unfurl_links: false,
      });

      try {
        await db.insert(ticketsTable).values({
          helpMessageTs: event.ts,
          helpReplyMessageTs: message.ts,
          openedBy: event.user!,
          text: event.text || "No preview available",
        });
      } catch (error) {
        await report(
          "remove the reply for an unrecorded ticket",
          app.request("chat.delete", {
            channel: event.channel.id,
            ts: message.ts,
          }),
        );
        throw error;
      }

      queueResendTicketsMessage();

      await report("add the hourglass reaction", event.react("hourglass"));
    }
  });
}

app.on("action:button.close", async (event) => {
  if (event.event.container.type !== "message") return;

  const [ticket] = await db
    .select()
    .from(ticketsTable)
    .where(
      and(
        eq(ticketsTable.helpReplyMessageTs, event.event.container.message_ts),
        isNull(ticketsTable.resolvedBy),
      ),
    );
  if (!ticket) return;

  const helpMessage = app
    .channel(event.event.container.channel_id)
    .message(ticket.helpMessageTs);

  let allowed = ticket.openedBy === event.event.user.id;
  if (!allowed) {
    try {
      allowed = (await getAdmins()).includes(event.event.user.id);
    } catch (error) {
      console.error("Failed to load the admin list:", error);
      await report(
        "report an admin lookup failure",
        helpMessage.reply({
          ephemeral: true,
          user: event.event.user.id,
          text: "Something went wrong checking your permissions. Please try again.",
        }),
      );
      return;
    }
  }

  if (!allowed) {
    await helpMessage.reply({
      ephemeral: true,
      user: event.event.user.id,
      text: "You are not allowed to close this ticket.",
    });
    return;
  }

  // Claim the close the same way the reopen is claimed, so a double click
  // only announces once.
  const [closed] = await db
    .update(ticketsTable)
    .set({ resolvedBy: event.event.user.id, resolvedAt: new Date() })
    .where(and(eq(ticketsTable.id, ticket.id), isNull(ticketsTable.resolvedBy)))
    .returning({ id: ticketsTable.id });
  if (!closed) return;

  queueResendTicketsMessage();

  await Promise.all([
    report(
      "announce a closed ticket",
      helpMessage.reply({
        text: `This ticket has been closed by <@${event.event.user.id}>. Send a new message here to open it at any time!`,
      }),
    ),
    report("remove the hourglass reaction", helpMessage.unreact("hourglass")),
  ]);
});

let cachedAdmins: Promise<string[]> | undefined;

async function getAdmins() {
  if (cachedAdmins) return cachedAdmins;
  if (!env.SLACK_TICKETS_CHANNEL) return [];

  const pending = app
    .channel(env.SLACK_TICKETS_CHANNEL)
    .members()
    .then((u) => u.map((x) => x.id));
  cachedAdmins = pending;

  pending.then(
    () =>
      setTimeout(() => {
        if (cachedAdmins === pending) cachedAdmins = undefined;
      }, 60_000),
    () => {
      if (cachedAdmins === pending) cachedAdmins = undefined;
    },
  );

  return pending;
}

let resendTicketsMessageTail: Promise<void> = Promise.resolve();

function queueResendTicketsMessage() {
  resendTicketsMessageTail = resendTicketsMessageTail
    .then(resendTicketsMessage)
    .catch((e) => {
      console.error("Failed to send tickets message:", e);
    });
}

async function resendTicketsMessage() {
  if (!env.SLACK_TICKETS_CHANNEL) return;

  const channel = env.SLACK_TICKETS_CHANNEL;

  const tickets = await db
    .select()
    .from(ticketsTable)
    .where(isNull(ticketsTable.resolvedBy))
    .orderBy(asc(ticketsTable.createdAt))
    .limit(50);

  // Every recorded summary is cleaned up, not just the newest one. A delete
  // that failed on an earlier run would otherwise be stranded in the channel
  // forever, still listing tickets that have since been closed.
  const stale = await db
    .select()
    .from(ticketSummariesTable)
    .orderBy(desc(ticketSummariesTable.createdAt))
    .limit(20);

  for (const summary of stale) {
    try {
      await app.request("chat.delete", { channel, ts: summary.ts });
    } catch (error) {
      if (!(
        error instanceof SlackWebAPIPlatformError &&
        error.error === "message_not_found"
      )) {
        console.error("Failed to delete a stale tickets message:", error);
        continue;
      }
    }

    await db
      .delete(ticketSummariesTable)
      .where(eq(ticketSummariesTable.ts, summary.ts));
  }

  const content = {
    blocks: blocks(
      header("Oldest open tickets"),
      richText(
        R.list(
          ...tickets.map((t) =>
            R.section(
              R.date(t.createdAt, "{date} at {time}"),
              " - ",
              R.user(t.openedBy),
              ` - `,
              R.link(
                `https://hackclub.slack.com/archives/${env.SLACK_HELP_CHANNEL}/p${t.helpMessageTs.replace(/\./g, "")}`,
                `"${t.text.substring(0, 50)}"`,
              ),
            ),
          ),
          ...(tickets.length ? [] : [R.section("No open tickets. Well done!")]),
        ),
      ),
    ),
    unfurl_links: false,
  } as const;

  const message = await app.channel(channel).send(content);

  try {
    await db.insert(ticketSummariesTable).values({ ts: message.ts });
  } catch (error) {
    await report(
      "remove an unrecorded tickets message",
      app.request("chat.delete", { channel, ts: message.ts }),
    );
    throw error;
  }
}
