export async function getHCAProfile(hcaToken: string): Promise<HCAIdentity> {
  const profileResp = await fetch("https://auth.hackclub.com/api/v1/me", {
    headers: { Authorization: `Bearer ${hcaToken}` },
  });

  if (!profileResp.ok) {
    console.error(
      "Failed to fetch HCA profile with status code",
      profileResp.status,
    );
    throw new Error("Failed to fetch profile");
  }

  const { identity } = (await profileResp.json()) as {
    identity: HCAIdentity;
  };

  return identity;
}

export interface HCAAddress {
  id: string;
  first_name: string;
  last_name: string;
  line_1: string;
  line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number: string;
  primary: boolean;
}

export interface HCAIdentity {
  id: string;
  first_name: string;
  last_name: string;
  // HCA's serializer strips blank fields (compact_blank), so anything that
  // can legitimately be unset, false, or empty is omitted rather than null.
  legal_first_name?: string;
  legal_last_name?: string;
  primary_email: string;
  birthday?: string;
  phone_number?: string;
  ysws_eligible?: boolean;
  verification_status: string;
  addresses?: HCAAddress[];
  slack_id?: string;
}
