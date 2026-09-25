# haven-site

The website for [Hack Club Haven](https://haven.hackclub.com), a game jam for
teens run by organizers in cities around the world.

Besides the landing page, the site:

- gives every active event its own city page at `/<slug>`, customized by the
  organizer (see [SITE_DATA.md](SITE_DATA.md));
- shows all events on a map at `/map`;
- runs the organizer (POC) signup flow: Hack Club Auth sign-in, then a Fillout
  form prefilled from the organizer's profile;
- runs a Slack bot that turns messages in the help channel into support tickets.

Events come from an Airtable base, which the server syncs into Postgres every
two minutes.

## Stack

SvelteKit (Node adapter), Svelte 5, Tailwind CSS 4, Drizzle ORM on
PostgreSQL, MapLibre with Protomaps tiles, and
[slack.ts](https://www.npmjs.com/package/slack.ts) for the bot.

## Development

You need Node 22.12+ and a PostgreSQL database. If you use Nix, `nix develop`
(or direnv, via `.envrc`) gives you the right Node.

```sh
npm install
cp .env.example .env   # then fill it in, see below
npm run db:migrate
npm run dev
```

`npm run check` type-checks the project.

### Environment

Every variable is listed in [.env.example](.env.example). You only need to
fill in the ones for the parts you're working on:

| Variables                                    | Used for                                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`, `ENCRYPTION_KEY`             | Always required. The key encrypts stored HCA tokens (`openssl rand -base64 32`).                                                                  |
| `AIRTABLE_*`                                 | Syncing events, which the city pages and the map need. `AIRTABLE_SECRET_KEY` is the shared secret Airtable automations send to `/api/airtable/*`. |
| `HCA_*`, `POC_SIGNUP_URL`, `AGE_CUTOFF_DATE` | The organizer signup flow.                                                                                                                        |
| `SLACK_*`                                    | The Slack bot and inviting new organizers to the main channel. The app manifest is in [slack-manifest.json](slack-manifest.json).                 |
| `EXTERNAL_URL`                               | The public URL of the site, used for OAuth redirects and CSRF checks.                                                                             |

### Database changes

Edit `src/lib/server/db/schema.ts`, then run `npm run db:generate` to write a
migration into `drizzle/` and `npm run db:migrate` to apply it. Commit the
generated migration.

## Deployment

The [Dockerfile](Dockerfile) builds a production image that serves on port 4321. It applies pending migrations on boot and exits if they fail, so the
server never runs against an outdated schema.

## Project layout

```
src/
  routes/            pages and API endpoints
    [slug]/          city pages
    api/auth/        Hack Club Auth sign-in
    api/fillout/     endpoints the POC signup form calls
    api/airtable/    endpoints Airtable automations call
    api/slack/       Slack events and interactivity
  lib/
    components/      page sections
    data/            default page content and the site data schema
    server/          database and services (Airtable sync, HCA)
    slack.ts         the Slack bot
drizzle/             generated migrations
scripts/             one-off maintenance scripts
```
