import type { RequestHandler } from "./$types";
import { checkAirtableAuth } from "$lib/airtable";
import { db } from "$lib/server/db";
import { usersTable } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { getHCAProfile } from "$lib/server/services/hca";

export const GET: RequestHandler = async ({ request }) => {
  const unauthorized = checkAirtableAuth(request);
  if (unauthorized) return unauthorized;

  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return Response.json(
      { success: false, message: "Missing auth token" },
      { status: 400 },
    );
  }

  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(token)) {
    return Response.json(
      { success: false, message: "Invalid auth token" },
      { status: 400 },
    );
  }

  const [user] = await db
    .select({ hcaToken: usersTable.hcaToken })
    .from(usersTable)
    .where(eq(usersTable.token, token));

  if (!user) {
    return Response.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );
  }

  const resp = await getHCAProfile(user.hcaToken);

  return Response.json({
    success: true,
    verificationStatus: resp.verification_status,
  });
};
