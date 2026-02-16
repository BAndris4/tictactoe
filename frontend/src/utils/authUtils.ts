export const serializePhone = (raw: string): string =>
  raw.normalize("NFKC").replace(/[^\d+]/g, "");
