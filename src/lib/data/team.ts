import z from "zod";
import teamJson from "./team.json";
import { linkSchema, objectPositionSchema, srcSchema } from "./types";

/**
 * The people on `/team`, edited in `team.json`.
 *
 * Unlike a city page this lives in the repo rather than Airtable, so it is held
 * to a stricter standard: an unknown key (`"imgae"`) or an unsafe link is an
 * error, and the error fails the build instead of quietly dropping the field.
 */
const memberSchema = z.strictObject({
  name: z.string().trim().min(1),
  pronouns: z.string().optional(),
  role: z.string().optional(),
  bio: z.string().optional(),
  /** A portrait; without one the card shows the person's initials. */
  image: srcSchema.optional(),
  position: objectPositionSchema,
  links: linkSchema.array().default([]),
});

const sectionSchema = z.strictObject({
  heading: z.string().optional(),
  blurb: z.string().optional(),
  members: memberSchema.array(),
});

const teamSchema = z.strictObject({
  meta: z
    .strictObject({
      title: z.string().optional(),
      description: z.string().optional(),
      image: srcSchema.optional(),
    })
    .default({}),
  heading: z.string(),
  subheading: z.string().optional(),
  sections: sectionSchema.array(),
  /** A closing button under the last section. */
  cta: linkSchema.optional(),
});
export type Team = z.infer<typeof teamSchema>;

/**
 * Parsed once, on import. SvelteKit imports every server route while it builds,
 * so a broken `team.json` stops `npm run build` with this message rather than
 * shipping a page that 500s.
 */
function parseTeam(): Team {
  const result = teamSchema.safeParse(teamJson);

  if (!result.success) {
    throw new Error(
      `src/lib/data/team.json is invalid:\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}

export const team = parseTeam();
