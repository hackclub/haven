import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const newUrl = new URL("/princeton", url);
  newUrl.search = url.search;
  return Response.redirect(newUrl);
};
