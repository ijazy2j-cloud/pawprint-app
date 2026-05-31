import sanitizeHtml from "sanitize-html";

// Strip ALL HTML to plain text. Uses sanitize-html (htmlparser2, pure JS) instead
// of isomorphic-dompurify so this runs on serverless Node without jsdom — jsdom@29
// require()s the ESM-only @exodus/bytes and crashes under CommonJS (ERR_REQUIRE_ESM).
export function sanitizePlainText(input: unknown) {
  const text = typeof input === "string" ? input : String(input ?? "");
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}

export function sanitizePlainTextFields<T extends Record<string, unknown>>(input: T, keys: Array<keyof T>): T {
  const copy = { ...input };
  for (const key of keys) copy[key] = sanitizePlainText(copy[key]) as T[keyof T];
  return copy;
}
