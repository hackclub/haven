import type { RequestHandler } from "./$types";
import z from "zod";
import { checkAirtableAuth } from "$lib/airtable";
import { notifySignup } from "$lib/slack";

const signupSchema = z.object({
  /** Record id of the event in the Events table, from the attendee's link. */
  eventId: z.string().regex(/^rec[A-Za-z0-9]{14}$/),
  email: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim(),
  pronouns: z.string().trim().nullish(),
  age: z.union([z.number(), z.string().trim()]).nullish(),
  role: z.enum(["Organizer", "Participant", "Volunteer"]),
});

/**
 * Called by an Airtable automation when someone signs up for an event, to
 * announce them in the channels and DMs the event's POC chose.
 */
export const POST: RequestHandler = async ({ request }) => {
  const unauthorized = checkAirtableAuth(request);
  if (unauthorized) return unauthorized;

  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { success: false, message: z.prettifyError(parsed.error) },
      { status: 400 },
    );
  }

  const result = await notifySignup(parsed.data);
  return Response.json({ success: true, ...result });
};
