import { randomBytes } from "crypto";
import cron from "node-cron";
import {
  actions,
  App,
  blocks,
  button,
  header,
  input,
  R,
  richText,
  section,
  select,
  SlackWebAPIPlatformError,
} from "slack.ts";
import { env } from "$env/dynamic/private";
import { db } from "./server/db";
import {
  eventsTable,
  signupNotificationsTable,
  signupSnapshotsTable,
  ticketsTable,
  ticketSummariesTable,
} from "./server/db/schema";
import {
  and,
  arrayContains,
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

/** The @haven-helpers user group, pinged about tickets open for a day. */
const HELPERS_GROUP = "S0C7XSYK884";

function ticketLink(helpMessageTs: string) {
  return `https://hackclub.slack.com/archives/${env.SLACK_HELP_CHANNEL}/p${helpMessageTs.replace(/\./g, "")}`;
}

/**
 * Pings the helpers once about every ticket that has gone a day since it was
 * opened without being resolved. Tickets are claimed before the ping so two
 * overlapping runs cannot both send one, and a failed ping releases its claim
 * for the next run to retry.
 */
async function escalateTickets() {
  const channel = env.SLACK_TICKETS_CHANNEL!;

  const due = await db
    .update(ticketsTable)
    .set({ escalatedAt: new Date() })
    .where(
      and(
        isNull(ticketsTable.resolvedBy),
        isNull(ticketsTable.escalatedAt),
        lt(ticketsTable.createdAt, new Date(Date.now() - 86400000)),
      ),
    )
    .returning();

  for (const ticket of due) {
    const link = ticketLink(ticket.helpMessageTs);
    try {
      await app.channel(channel).send({
        text: `<!subteam^${HELPERS_GROUP}> A ticket has been open for 24 hours without being resolved: ${link}`,
        blocks: blocks(
          richText(
            R.section(
              R.usergroup(HELPERS_GROUP),
              " this ticket from ",
              R.user(ticket.openedBy),
              " has been open for 24 hours without being resolved: ",
              R.link(link, `"${ticket.text.substring(0, 50)}"`),
              ". Can someone take a look and resolve it?",
            ),
          ),
        ),
        unfurl_links: false,
      });
    } catch (error) {
      console.error("Failed to escalate a ticket:", error);
      await db
        .update(ticketsTable)
        .set({ escalatedAt: null })
        .where(eq(ticketsTable.id, ticket.id));
    }
  }
}

if (env.SLACK_TICKETS_CHANNEL) {
  cron.schedule("* * * * *", escalateTickets);
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
  // Sorting is stable, so events that gained the same keep their signup order.
  const byGained = [...ranked].sort((a, b) => b.gained - a.gained);
  const movers = byGained.filter((e) => e.gained > 0).slice(0, 10);

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
              caption: "All events by new signups",
              page_size: 10,
              row_header_column_index: 1,
              rows: [
                ["#", "Event", "Signups", "New"].map((text) => ({
                  type: "raw_text",
                  text,
                })),
                // A table holds at most 200 data rows.
                ...byGained.slice(0, 200).map((e, i) => [
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
                ticketLink(t.helpMessageTs),
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

const COMMAND_PREFIX = env.SLACK_COMMAND_PREFIX ?? "";

const SIGNUP_COMMAND = `/${COMMAND_PREFIX}haven-signups` as const;
const SIGNUP_CALLBACK = "signup_notifications";

/** Whether a picked conversation is a person, to be sent a DM by the bot. */
const isUserId = (id: string) => /^[UW][A-Z0-9]+$/.test(id);

/** How to mention a picked conversation in a message. */
const mention = (id: string) => (isUserId(id) ? `<@${id}>` : `<#${id}>`);

/**
 * Why signups cannot be posted to a channel, or null when they can. They carry
 * an attendee's email and age, so the channel has to be private, internal to
 * the workspace and already have the bot in it. The bot is never added to a
 * channel on a POC's behalf.
 */
async function signupChannelProblem(id: string): Promise<string | null> {
  let channel;
  try {
    ({ channel } = await app.request("conversations.info", { channel: id }));
  } catch (error) {
    // A private channel the bot is not in looks exactly like one that does
    // not exist.
    if (
      error instanceof SlackWebAPIPlatformError &&
      error.error === "channel_not_found"
    ) {
      console.log(error, id);
      return "the bot is not in it";
    }
    throw error;
  }

  // A DM id here is someone else's DM, which the bot cannot post in.
  if (!channel.is_private || channel.is_im || channel.is_mpim) {
    return "it is not a private channel";
  }
  if (channel.is_ext_shared) return "it is shared with another organization";
  if (channel.is_archived) return "it is archived";
  if (!channel.is_member) return "the bot is not in it";
  return null;
}

/** The active events a Slack user is a POC of, alphabetically. */
function eventsForPoc(userId: string) {
  return db
    .select({
      id: eventsTable.airtableId,
      slug: eventsTable.slug,
      name: eventsTable.name,
    })
    .from(eventsTable)
    .where(arrayContains(eventsTable.pocSlackIds, [userId]))
    .orderBy(asc(eventsTable.name));
}

app.on(SIGNUP_COMMAND, async (command) => {
  const events = await eventsForPoc(command.user_id);

  if (!events.length) {
    await command.respond.message({
      ephemeral: true,
      text: "Only the POC of an active Haven event can set up its signup notifications.",
    });
    return;
  }

  const slug = command.text.trim();
  const event =
    events.length === 1 && !slug
      ? events[0]
      : events.find((e) => e.slug === slug);

  if (!event) {
    await command.respond.message({
      ephemeral: true,
      text: `Which event? Run \`${SIGNUP_COMMAND} <slug>\` with one of: ${events.map((e) => `\`${e.slug}\``).join(", ")}.`,
    });
    return;
  }

  const [current] = await db
    .select()
    .from(signupNotificationsTable)
    .where(eq(signupNotificationsTable.eventId, event.id));

  const picker = select()
    .multiple()
    .conversations()
    .id(`signup_conversations::${event.id}`)
    .placeholder("Pick private channels or people");
  if (current?.conversationIds.length) {
    picker.default(...current.conversationIds);
  }

  const pickerInput = input("Send signups to", picker)
    .id("conversations")
    .hint(
      "Private channels need the Haven bot added first. People get a DM from the bot.",
    )
    .optional()
    .build();

  await command.respond.message({
    ephemeral: true,
    blocks: [
      ...blocks(
        richText(
          R.section(
            "Choose where to hear about new signups for ",
            R.text(event.name).bold(),
            ". Each one includes the attendee's name, email, pronouns and age, so keep the list to people who need it.",
          ),
        ),
      ),
      {
        ...pickerInput,
        element: {
          ...pickerInput.element,
          // The bot checks this again on save; the filter just keeps public
          // channels and group DMs out of the picker. A person picked from
          // "im" comes back as their user id.
          filter: {
            include: ["private", "im"],
            exclude_external_shared_channels: true,
            exclude_bot_users: true,
          },
        },
      },
    ],
  });
});

app.on(`action:multi_conversations_select`, async (action) => {
  if (!action.action_id.startsWith("signup_conversations::")) return;

  const userId = action.event.user.id;
  const eventId = action.action_id.substring(22);
  const user = app.user(userId);

  // The POC list can change while the modal is open.
  const [event] = (await eventsForPoc(userId)).filter((e) => e.id === eventId);
  if (!event) {
    await action.respond.edit(
      "Your signup notification settings were not saved: you are no longer the POC of that event.",
    );
    return;
  }

  const requested = action.selected_conversations ?? [];

  const problems = await Promise.all(
    requested.map((id) => (isUserId(id) ? null : signupChannelProblem(id))),
  );
  const conversationIds = requested.filter((_, i) => !problems[i]);
  const rejected = requested
    .map((id, i) => ({ id, problem: problems[i] }))
    .filter((c) => c.problem);

  await db
    .insert(signupNotificationsTable)
    .values({ eventId, conversationIds, updatedBy: userId })
    .onConflictDoUpdate({
      target: signupNotificationsTable.eventId,
      set: { conversationIds, updatedBy: userId, updatedAt: new Date() },
    });

  const where = conversationIds.map(mention);
  const lines = [
    where.length
      ? `New signups for *${event.name}* will go to ${where.join(", ")}.`
      : `Signup notifications for *${event.name}* are off.`,
    ...rejected.map(
      (c) =>
        `:warning: ${mention(c.id)} was not added because ${c.problem}. Signups include personal information, so only people and private channels the bot is in can be used.`,
    ),
  ];
  await action.respond.message({
    ephemeral: true,
    text: lines.join("\n"),
  });
});

export interface Signup {
  eventId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "Organizer" | "Participant" | "Volunteer";
  pronouns?: string | null;
  age?: number | string | null;
}

/**
 * Announces a new signup wherever its event's POC asked. Channels are checked
 * again first, in case one was made public or had the bot removed since it was
 * saved. Returns how many messages went out.
 */
export async function notifySignup(signup: Signup) {
  const [settings] = await db
    .select()
    .from(signupNotificationsTable)
    .where(eq(signupNotificationsTable.eventId, signup.eventId));
  if (!settings) return { sent: 0, failed: 0 };

  const [event] = await db
    .select({ name: eventsTable.name })
    .from(eventsTable)
    .where(eq(eventsTable.airtableId, signup.eventId));
  const eventName = event?.name ?? "your event";

  const name = `${signup.firstName} ${signup.lastName}`.trim();
  const message = {
    // The fallback ends up in push notifications, so it has no PII in it.
    text: `New signup for ${eventName}`,
    // Rich text rather than mrkdwn, so nothing the attendee typed is parsed as
    // a mention or a link.
    blocks: blocks(
      richText(
        R.section(R.text(`New signup for ${eventName}`).bold()),
        R.list(
          R.section(R.text("Role: ").bold(), signup.role),
          R.section(R.text("Name: ").bold(), name),
          R.section(R.text("Pronouns: ").bold(), signup.pronouns || "-"),
          R.section(R.text("Age at event: ").bold(), `${signup.age ?? "-"}`),
          R.section(R.text("Email: ").bold(), signup.email),
        ),
      ),
    ),
    unfurl_links: false,
  } as const;

  const results = await Promise.allSettled(
    settings.conversationIds.map(async (id) => {
      if (isUserId(id)) return app.user(id).send(message);

      const problem = await signupChannelProblem(id);
      if (problem) throw new Error(`Skipped <#${id}>: ${problem}`);
      return app.channel(id).send(message);
    }),
  );

  const failures = results.filter((r) => r.status === "rejected");
  for (const failure of failures) {
    console.error("Failed to send a signup notification:", failure.reason);
  }

  return { sent: results.length - failures.length, failed: failures.length };
}
