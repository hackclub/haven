import { env } from "../env";

const API_ROOT = "https://api.airtable.com/v0";

/**
 * Airtable's own ceiling is 5 requests/second per base, but we deliberately sit
 * an order below it: nothing here is latency-sensitive, and staying at 1 RPS
 * leaves the whole per-base budget free for the automations that write to it.
 */
const MIN_REQUEST_INTERVAL_MS = 1000;

/**
 * One shared gate for every Airtable call in the process. Each request chains
 * onto the previous one and then waits out the remainder of the interval, so
 * concurrent callers queue instead of bursting — a per-call `setTimeout` would
 * only space out the requests one caller makes, not the ones two make at once.
 */
let gate: Promise<void> = Promise.resolve();

function rateLimit<T>(run: () => Promise<T>): Promise<T> {
  const result = gate.then(run);

  // Advance the gate whether or not the request succeeded: a failure still
  // consumed a slot, and a rejected gate would poison every later call.
  gate = result.then(
    () =>
      new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS)),
    () =>
      new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS)),
  );

  return result;
}

interface AirtableRecord {
  id: string;
  createdTime: string;
  /** Keyed by field *id* — see `returnFieldsByFieldId` below. */
  fields: Record<string, unknown>;
}

interface AirtablePage {
  records: AirtableRecord[];
  offset?: string;
}

export interface ListOptions {
  /**
   * Restrict the read to one view, which applies that view's own filter and
   * sort. Optional: without it the whole table comes back. Note that a view
   * can also hide *fields*, and a hidden field is omitted from the response
   * even when asked for by id — so a view used here must show everything in
   * `fieldIds`.
   */
  viewId?: string;
}

/**
 * Every record in a table, one paginated request at a time.
 *
 * Fields are requested and returned by id rather than by name: several of the
 * ones we want are called things like `!Latitude` and `_Is Test`, and a rename
 * in Airtable would silently start returning nothing for them.
 */
export async function listRecords(
  tableId: string,
  fieldIds: string[],
  { viewId }: ListOptions = {},
): Promise<AirtableRecord[]> {
  const token = env.AIRTABLE_TOKEN;
  if (!token) throw new Error("AIRTABLE_TOKEN is not set");

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`${API_ROOT}/${env.AIRTABLE_BASE_ID}/${tableId}`);
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("returnFieldsByFieldId", "true");
    for (const fieldId of fieldIds)
      url.searchParams.append("fields[]", fieldId);
    if (viewId) url.searchParams.set("view", viewId);
    if (offset) url.searchParams.set("offset", offset);

    const response = await rateLimit(() =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
    );

    if (!response.ok) {
      throw new Error(
        `Airtable ${tableId} returned ${response.status}: ${await response.text()}`,
      );
    }

    const page = (await response.json()) as AirtablePage;
    records.push(...page.records);
    offset = page.offset;
  } while (offset);

  return records;
}
