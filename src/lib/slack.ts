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
} from "slack.ts";
import { env } from "./env";
import { db } from "./db";
import { ticketsTable, ticketSummariesTable } from "./db/schema";
import { and, asc, desc, eq, not } from "drizzle-orm";

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

if (env.SLACK_HELP_CHANNEL) {
  app.on(`message#${env.SLACK_HELP_CHANNEL}`, async (event) => {
    if (event.user === env.SLACK_BOT_USER_ID) return;
    if (event.subtype && (event.subtype as string) !== "file_shared") return;

    const shouldResend = await db.transaction(async (tx) => {
      if (event.thread_ts) {
        const [ticket] = await tx
          .select()
          .from(ticketsTable)
          .where(eq(ticketsTable.helpMessageTs, event.thread_ts));

        if (ticket?.resolved && event.user !== ticket.openedBy) return;

        await tx
          .update(ticketsTable)
          .set({ resolved: false, latestMessageAt: new Date() })
          .where(eq(ticketsTable.helpMessageTs, event.thread_ts));

        if (ticket?.resolved) {
          await Promise.all([
            event.reply(
              "This ticket has been reopened. A staff member will help you soon!",
            ),
            event.channel.message(event.thread_ts).react("hourglass"),
          ]);

          return true;
        }

        return false;
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

        await Promise.all([
          tx.insert(ticketsTable).values({
            helpMessageTs: event.ts,
            helpReplyMessageTs: message.ts,
            openedBy: event.user!,
            text: event.text || "No preview available",
          }),
          event.react("hourglass"),
        ]);

        return true;
      }
    });

    if (shouldResend) queueResendTicketsMessage();
  });
}

app.on("action:button.close", async (event) => {
  await db.transaction(async (tx) => {
    if (event.event.container.type !== "message") return;

    const [ticket] = await tx
      .select()
      .from(ticketsTable)
      .where(
        and(
          eq(ticketsTable.helpReplyMessageTs, event.event.container.message_ts),
          not(ticketsTable.resolved),
        ),
      );
    if (!ticket) return;

    const helpMessage = app
      .channel(event.event.container.channel_id)
      .message(ticket.helpMessageTs);

    const allowed =
      ticket.openedBy === event.event.user.id ||
      (await getAdmins())?.includes(event.event.user.id);

    if (!allowed) {
      await helpMessage.reply({
        ephemeral: true,
        user: event.event.user.id,
        text: "You are not allowed to close this ticket.",
      });
      return;
    }

    await Promise.all([
      tx
        .update(ticketsTable)
        .set({ resolved: true })
        .where(eq(ticketsTable.id, ticket.id)),
      helpMessage.reply({
        text: `This ticket has been closed by <@${event.event.user.id}>. Send a new message here to open it at any time!`,
      }),
      helpMessage.unreact("hourglass"),
    ]);
  });

  queueResendTicketsMessage();
});

let cachedAdmins: Promise<string[]> | undefined;

async function getAdmins() {
  if (cachedAdmins) return cachedAdmins;
  if (!env.SLACK_TICKETS_CHANNEL) return [];

  cachedAdmins = app
    .channel(env.SLACK_TICKETS_CHANNEL)
    .members()
    .then((u) => u.map((x) => x.id));

  setTimeout(() => (cachedAdmins = undefined), 60_000);

  return cachedAdmins;
}

let resendTicketsMessageTail: Promise<void> = Promise.resolve();

function queueResendTicketsMessage() {
  resendTicketsMessageTail = resendTicketsMessageTail
    .then(async () => {
      if (!env.SLACK_TICKETS_CHANNEL) return;

      const tickets = await db
        .select()
        .from(ticketsTable)
        .where(and(not(ticketsTable.resolved)))
        .orderBy(asc(ticketsTable.createdAt))
        .limit(50);

      const [ticketSummary] = await db
        .select()
        .from(ticketSummariesTable)
        .orderBy(desc(ticketSummariesTable.createdAt))
        .limit(1);

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
              ...(tickets.length
                ? []
                : [R.section("No open tickets. Well done!")]),
            ),
          ),
        ),
        unfurl_links: false,
      } as const;

      if (ticketSummary) {
        // await app
        //   .channel(env.SLACK_TICKETS_CHANNEL)
        //   .message(ticketSummary.ts)
        //   .edit(content);
        app
          .request("chat.delete", {
            channel: env.SLACK_TICKETS_CHANNEL,
            ts: ticketSummary.ts,
          })
          .catch(() => {});
      }

      const message = await app
        .channel(env.SLACK_TICKETS_CHANNEL)
        .send(content);

      await db.insert(ticketSummariesTable).values({ ts: message.ts });
    })
    .catch((e) => {
      console.error("Failed to send tickets message:", e);
    });
}
