import type { PageServerLoad } from "./$types";
import { team } from "$lib/data/team";

/** Static, but loaded on the server so the JSON is validated in one place. */
export const load: PageServerLoad = () => ({ team });
