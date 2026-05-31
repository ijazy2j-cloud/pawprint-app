import DOMPurify from "isomorphic-dompurify";

export function sanitizePlainText(input: unknown) {
  const text = typeof input === "string" ? input : String(input ?? "");
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

export function sanitizePlainTextFields<T extends Record<string, unknown>>(input: T, keys: Array<keyof T>): T {
  const copy = { ...input };
  for (const key of keys) copy[key] = sanitizePlainText(copy[key]) as T[keyof T];
  return copy;
}
