import type { RequestHandler } from "./$types";

export const GET: RequestHandler = () => {
  return Response.redirect("https://haven-burlington.breynard.net/");
};
