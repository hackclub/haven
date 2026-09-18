import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async () => {
  return Response.json({ success: true });
};
