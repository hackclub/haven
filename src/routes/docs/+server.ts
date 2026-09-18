import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { stepsCta } from "$lib/data/content";

export const GET: RequestHandler = () => {
  redirect(307, stepsCta.href);
};
