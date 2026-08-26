import type { APIRoute } from "astro";
import { stepsCta } from "../data/content";

export const GET: APIRoute = ({ redirect }) => {
  return redirect(stepsCta.href, 307);
};
