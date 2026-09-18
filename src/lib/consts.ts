import { env } from "$env/dynamic/private";

export const EXTERNAL_URL =
  env.EXTERNAL_URL || env.SITE || "https://haven.hackclub.com";
