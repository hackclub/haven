import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const newUrl = new URL("https://haven-yerevan.vercel.app/yerevan");
  newUrl.search = url.search;
  return Response.redirect(newUrl);
};
