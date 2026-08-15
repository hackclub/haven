import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db";
import { usersTable } from "../../../lib/db/schema";
import { EXTERNAL_URL } from "../../../lib/consts";
import { env } from "../../../lib/env";

const ADULT_AGE = 19;

function isAdultByCutoff(birthday: string, cutoffDate: Date) {
  const adultBirthday = new Date(birthday);
  adultBirthday.setUTCFullYear(adultBirthday.getUTCFullYear() + ADULT_AGE);
  return adultBirthday <= cutoffDate;
}

export const POST: APIRoute = async ({ request }) => {
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const token = request.headers.get("x-auth-token")?.trim();
  if (!token || !UUID_RE.test(token)) {
    return Response.json({
      success: false,
      message: `The token in the form URL is invalid. Please click the POC sign up button on ${EXTERNAL_URL} to try again!`,
    });
  }

  const [user] = await db
    .select({
      hcaId: usersTable.hcaId,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      legalFirstName: usersTable.legalFirstName,
      legalLastName: usersTable.legalLastName,
      primaryEmail: usersTable.primaryEmail,
      birthday: usersTable.birthday,
      phoneNumber: usersTable.phoneNumber,
      yswsEligible: usersTable.yswsEligible,
      verificationStatus: usersTable.verificationStatus,
      address: usersTable.address,
      overrideIneligible: usersTable.overrideIneligible,
      slackId: usersTable.slackId,
    })
    .from(usersTable)
    .where(eq(usersTable.token, token));

  if (!user)
    return Response.json({
      success: false,
      message: `The token in the URL is invalid. Please click the POC sign up button on ${EXTERNAL_URL} to try again!`,
    });

  const cutoffDate = new Date(env.AGE_CUTOFF_DATE);
  const defaultShippingFirstName = user.legalFirstName || user.firstName;
  const defaultShippingLastName = user.legalLastName || user.lastName;

  const willBeAdult = user.overrideIneligible
    ? false
    : user.birthday
      ? isAdultByCutoff(user.birthday, cutoffDate)
      : null;
  const overrideShippingName =
    user.address?.first_name !== defaultShippingFirstName ||
    user.address?.last_name !== defaultShippingLastName;

  return Response.json({
    success: true,
    message: "Successfully fetched user data",
    ...user,
    willBeAdult,
    overrideShippingName,
  });
};
