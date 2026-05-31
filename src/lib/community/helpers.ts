export const communityBlockedWords = [
  "badword",
  "idiot",
  "stupid",
  "මෝඩ",
  "පිස්සු",
  "හුත්ත",
  "පක",
];

export function containsExternalLink(value: string) {
  return /https?:\/\/\S+/gi.test(value);
}

export function containsBlockedCommunityContent(value: string) {
  const lower = value.toLowerCase();
  return communityBlockedWords.some((word) => lower.includes(word.toLowerCase()));
}

export type CommunityReactionType = "LOVE" | "CELEBRATE" | "PAWPRINT";

export function countReactions(reactions: Array<{ type: CommunityReactionType }>) {
  return reactions.reduce(
    (counts, reaction) => {
      counts[reaction.type] += 1;
      return counts;
    },
    { LOVE: 0, CELEBRATE: 0, PAWPRINT: 0 } as Record<"LOVE" | "CELEBRATE" | "PAWPRINT", number>,
  );
}

export function nextReactionState(current: CommunityReactionType | null, clicked: CommunityReactionType) {
  return current === clicked ? null : clicked;
}

export function transformCloudinaryUrl(url?: string | null) {
  if (!url || !url.includes("/image/upload/") || url.includes("/f_auto,q_auto,w_800/")) return url ?? "";
  return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_800/");
}

export function relativeTime(date: Date) {
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
