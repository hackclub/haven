import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ url }) => {
  const newUrl = new URL("https://haven-lyon.vercel.app/");
  newUrl.search = url.search;
  redirect(302, newUrl);
};
