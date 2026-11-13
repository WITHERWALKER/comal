import { randomInt } from "node:crypto";

const FOLIO_PREFIX = "CM";

const FOLIO_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
const FOLIO_SUFFIX_LENGTH = 6;

export function generateOrderFolio(): string {
  let suffix = "";
  for (let i = 0; i < FOLIO_SUFFIX_LENGTH; i++) {
    suffix += FOLIO_ALPHABET[randomInt(FOLIO_ALPHABET.length)]!;
  }
  return `${FOLIO_PREFIX}-${suffix}`;
}
