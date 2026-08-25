function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
  get ENCRYPTION_KEY() {
    return required("ENCRYPTION_KEY");
  },
  get AIRTABLE_SECRET_KEY() {
    return required("AIRTABLE_SECRET_KEY");
  },
  get AGE_CUTOFF_DATE() {
    return required("AGE_CUTOFF_DATE");
  },
  get POC_SIGNUP_URL() {
    return required("POC_SIGNUP_URL");
  },
  /**
   * Attendee RSVP form. Optional: the hero only shows the "just want to
   * attend" link when it is set, so a missing value hides that link rather
   * than failing the page render.
   */
  get RSVP_URL() {
    return optional("RSVP_URL");
  },
  get HCA_CLIENT_ID() {
    return required("HCA_CLIENT_ID");
  },
  get HCA_CLIENT_SECRET() {
    return required("HCA_CLIENT_SECRET");
  },
  get EXTERNAL_URL() {
    return (
      optional("EXTERNAL_URL") ||
      optional("SITE") ||
      "https://haven.hackclub.com"
    );
  },
  get SLACK_BOT_TOKEN() {
    return optional("SLACK_BOT_TOKEN");
  },
  get SLACK_BOT_USER_ID() {
    return optional("SLACK_BOT_USER_ID");
  },
  get SLACK_MAIN_CHANNEL() {
    return optional("SLACK_MAIN_CHANNEL");
  },
  get SLACK_HELP_CHANNEL() {
    return optional("SLACK_HELP_CHANNEL");
  },
  get SLACK_TICKETS_CHANNEL() {
    return optional("SLACK_TICKETS_CHANNEL");
  },
  get SLACK_SIGNING_SECRET() {
    return optional("SLACK_SIGNING_SECRET");
  },
};
