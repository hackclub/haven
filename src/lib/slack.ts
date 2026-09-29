import { randomBytes } from "crypto";
import cron from "node-cron";
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
import { env } from "$env/dynamic/private";
import { db } from "./server/db";
import {
  eventsTable,
  signupSnapshotsTable,
  ticketsTable,
  ticketSummariesTable,
} from "./server/db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  isNotNull,
  isNull,
  lt,
  ne,
} from "drizzle-orm";

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
    if (event.subtype && (event.subtype as string) !== "file_share") return;

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

async function sendLeaderboard() {
  const resolvers = (
    await db
      .select({ user: ticketsTable.resolvedBy, count: count() })
      .from(ticketsTable)
      .where(
        and(
          gt(ticketsTable.resolvedAt, new Date(Date.now() - 86400000)),
          ne(ticketsTable.resolvedBy, ticketsTable.openedBy),
        ),
      )
      .groupBy(ticketsTable.resolvedBy)
  )
    .filter((r) => r.user)
    .sort((a, b) => b.count - a.count);

  await app.channel(env.SLACK_TICKETS_CHANNEL!).send({
    text: "Ticket leaderboard (past 24h)",
    blocks: blocks(
      header("Ticket leaderboard (past 24h)"),
      resolvers.length
        ? richText(
            R.list(
              ...resolvers.map((r) =>
                R.section(
                  R.user(r.user!),
                  ": ",
                  R.text(`${r.count}`).bold(),
                  " tickets resolved",
                ),
              ),
            ).numbered(),
          )
        : section("No tickets resolved in the past 24h."),
    ),
  });
}

if (env.SLACK_TICKETS_CHANNEL) {
  cron.schedule("0 0 * * *", sendLeaderboard);

  app.on(`message#${env.SLACK_TICKETS_CHANNEL}`, async (message) => {
    if (message.text === "!leaderboard") {
      await sendLeaderboard();
    }
  });
}

/**
 * Shortens event names to fit chart labels (20 characters max), keeping them
 * unique, since each chart category has to match exactly one data point.
 */
function chartLabels(names: string[]) {
  const seen = new Set<string>();
  return names.map((name) => {
    let label = name.length > 20 ? `${name.slice(0, 19)}…` : name;
    for (let i = 2; seen.has(label); i++) {
      const suffix = ` ${i}`;
      label = `${name.slice(0, 19 - suffix.length)}…${suffix}`;
    }
    seen.add(label);
    return label;
  });
}

function barChart(title: string, series: string, points: [string, number][]) {
  const labels = chartLabels(points.map(([name]) => name));
  return {
    type: "data_visualization",
    title,
    chart: {
      type: "bar",
      series: [
        {
          name: series,
          data: points.map(([, value], i) => ({ label: labels[i], value })),
        },
      ],
      axis_config: { categories: labels },
    },
  };
}

/**
 * Posts every active event ranked by participant count, with how many signed
 * up since the last daily post. Only the daily post saves a new baseline, so
 * asking for the leaderboard by hand does not reset the day's numbers.
 */
async function sendSignupLeaderboard({ daily }: { daily: boolean }) {
  const events = await db
    .select({
      id: eventsTable.airtableId,
      name: eventsTable.name,
      count: eventsTable.participantCount,
    })
    .from(eventsTable)
    .orderBy(desc(eventsTable.participantCount), asc(eventsTable.name));

  const [baseline] = await db
    .select()
    .from(signupSnapshotsTable)
    .orderBy(desc(signupSnapshotsTable.createdAt))
    .limit(1);

  const ranked = events.map((e) => ({
    ...e,
    // An event that is new since the baseline started from zero.
    gained: baseline ? e.count - (baseline.counts[e.id] ?? 0) : 0,
  }));
  const total = ranked.reduce((sum, e) => sum + e.count, 0);
  const gained = ranked.reduce((sum, e) => sum + Math.max(e.gained, 0), 0);
  const movers = ranked
    .filter((e) => e.gained > 0)
    .sort((a, b) => b.gained - a.gained)
    .slice(0, 10);

  const summary = baseline
    ? `*${total}* signups across *${ranked.length}* events, *+${gained}* since the last leaderboard.`
    : `*${total}* signups across *${ranked.length}* events.`;

  await app.channel(env.SLACK_SIGNUPS_CHANNEL!).send({
    text: `Signup leaderboard: ${total} signups across ${ranked.length} events`,
    blocks: [
      ...blocks(header("Signup leaderboard"), section(summary)),
      ...(ranked.length
        ? [
            barChart(
              "Top events by signups",
              "Signups",
              ranked.slice(0, 15).map((e) => [e.name, e.count]),
            ),
          ]
        : []),
      ...(movers.length
        ? [
            barChart(
              "Most new signups",
              "New signups",
              movers.map((e) => [e.name, e.gained]),
            ),
          ]
        : []),
      ...(ranked.length
        ? [
            {
              type: "data_table",
              caption: "All events by signups",
              page_size: 10,
              row_header_column_index: 1,
              rows: [
                ["#", "Event", "Signups", "New"].map((text) => ({
                  type: "raw_text",
                  text,
                })),
                // A table holds at most 200 data rows.
                ...ranked.slice(0, 200).map((e, i) => [
                  { type: "raw_number", value: i + 1, text: `${i + 1}` },
                  { type: "raw_text", text: e.name },
                  { type: "raw_number", value: e.count, text: `${e.count}` },
                  {
                    type: "raw_number",
                    value: e.gained,
                    text: e.gained > 0 ? `+${e.gained}` : `${e.gained}`,
                  },
                ]),
              ],
            },
          ]
        : []),
    ],
  });

  if (daily) {
    await db.insert(signupSnapshotsTable).values({
      counts: Object.fromEntries(ranked.map((e) => [e.id, e.count])),
    });
  }
}

if (env.SLACK_SIGNUPS_CHANNEL) {
  cron.schedule("0 0 * * *", () => sendSignupLeaderboard({ daily: true }));

  app.on(`message#${env.SLACK_SIGNUPS_CHANNEL}`, async (message) => {
    if (
      env.SLACK_SIGNUPS_USER_ID &&
      message.text === "!signups" &&
      message.user === env.SLACK_SIGNUPS_USER_ID
    ) {
      await sendSignupLeaderboard({ daily: false });
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
      if (
        !(
          error instanceof SlackWebAPIPlatformError &&
          error.error === "message_not_found"
        )
      ) {
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
