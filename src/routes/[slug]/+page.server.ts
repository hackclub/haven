import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { resolveSiteData } from "$lib/data/site";
import { getDataForSlug } from "$lib/server/services/websites";

export const load: PageServerLoad = async ({ params }) => {
  const data = await getDataForSlug(params.slug);

  if (!data) error(404, "Not found");

  return { site: resolveSiteData(data) };
};
