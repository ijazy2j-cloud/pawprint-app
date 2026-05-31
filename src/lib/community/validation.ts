import { z } from "zod";

import { containsBlockedCommunityContent, containsExternalLink } from "./helpers";
import { sanitizePlainText } from "@/lib/security/sanitize";

export const communityPostTags = ["RESCUE", "ADOPTION", "REUNION", "DAILY_JOY"] as const;
export const communityReactionTypes = ["LOVE", "CELEBRATE", "PAWPRINT"] as const;

const noLinks = (value: string) => !containsExternalLink(value);
const kind = (value: string) => !containsBlockedCommunityContent(value);

export const communityPostSchema = z.object({
  content: z.preprocess((v) => sanitizePlainText(v), z.string().trim().min(1).max(500)).refine(noLinks, "Links are not allowed in community posts to keep our space safe.").refine(kind, "Let's keep our community kind and friendly."),
  photos: z.array(z.string().url()).max(3).default([]),
  tag: z.enum(communityPostTags).optional(),
});

export const communityCommentSchema = z.object({
  content: z.preprocess((v) => sanitizePlainText(v), z.string().trim().min(1).max(300)).refine(noLinks, "Links are not allowed in community posts to keep our space safe.").refine(kind, "Let's keep our community kind and friendly."),
});

export const communityReactionSchema = z.object({
  type: z.enum(communityReactionTypes),
});

export const reportCommentSchema = z.object({
  reason: z.string().trim().min(3).max(300).refine(noLinks, "Links are not allowed in community posts to keep our space safe."),
});

export type CommunityPostInput = z.infer<typeof communityPostSchema>;
export type CommunityCommentInput = z.infer<typeof communityCommentSchema>;
