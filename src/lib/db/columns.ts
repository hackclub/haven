import { customType } from "drizzle-orm/pg-core";
import { decrypt, encrypt } from "../crypto";

/**
 * A `text` column that is encrypted before it hits the database and decrypted
 * on the way out, so callers only ever see the plaintext.
 */
export const encryptedText = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return "text";
  },
  toDriver(value) {
    return encrypt(value);
  },
  fromDriver(value) {
    return decrypt(value);
  },
});
