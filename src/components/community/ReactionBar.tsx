"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";

import { toggleCommunityReaction } from "@/app/community/actions";
import { Button } from "@/components/ui/button";
import type { CommunityReactionType } from "@/lib/community/helpers";

type Counts = Record<CommunityReactionType, number>;

export function ReactionBar({ postId, counts, mine, loggedIn }: { postId: string; counts: Counts; mine: CommunityReactionType | null; loggedIn: boolean }) {
  const [pending, startTransition] = useTransition();
  const [state, optimistic] = useOptimistic({ counts, mine }, (current, clicked: CommunityReactionType) => { const nextCounts = { ...current.counts }; if (current.mine === clicked) { nextCounts[clicked] -= 1; return { counts: nextCounts, mine: null }; } if (current.mine) nextCounts[current.mine] -= 1; nextCounts[clicked] += 1; return { counts: nextCounts, mine: clicked }; });
  function react(type: CommunityReactionType) { if (!loggedIn) return; optimistic(type); startTransition(async () => toggleCommunityReaction(postId, type)); }
  const buttons: Array<[CommunityReactionType, string]> = [["LOVE", "❤️ Love"], ["CELEBRATE", "🎉 Celebrate"], ["PAWPRINT", "🐾 PawPrint"]];
  return <div className="flex flex-wrap gap-2">{buttons.map(([type, label]) => loggedIn ? <Button key={type} type="button" variant={state.mine === type ? "default" : "outline"} size="sm" disabled={pending} onClick={() => react(type)} className="active:scale-125 active:animate-heart-pop">{label} {state.counts[type]}</Button> : <Button key={type} asChild variant="outline" size="sm" className="active:scale-125"><Link href="/login">{label} {state.counts[type]}</Link></Button>)}</div>;
}
