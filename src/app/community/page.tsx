export const metadata = { title: "Happy Tails Community — PawPrint Sri Lanka", description: "Read and share uplifting rescue, adoption, reunion, and daily joy stories." };

import { getServerSession } from "next-auth";
import Link from "next/link";
import { PenLine, Sparkles } from "lucide-react";

import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function param(searchParams: Record<string, string | string[] | undefined> | undefined, key: string) { const value = searchParams?.[key]; return Array.isArray(value) ? value[0] : value; }
const fallback = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1000";

export default async function CommunityPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const session = await getServerSession(authOptions);
  const sort = param(searchParams, "sort") ?? "newest";
  const cursor = param(searchParams, "cursor");
  const take = 12;
  // independent queries run in parallel (was sequential: posts → spotlight)
  const [posts, spotlight] = await Promise.all([
    prisma.communityPost.findMany({ take: take + 1, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), include: { author: true, reactions: true, comments: { include: { author: true }, orderBy: { createdAt: "asc" } } }, orderBy: sort === "spotlight" ? [{ isSpotlight: "desc" }, { spotlightAt: "desc" }, { createdAt: "desc" }] : { createdAt: "desc" } }),
    prisma.communityPost.findMany({ where: { isSpotlight: true }, take: 3, orderBy: { spotlightAt: "desc" }, include: { author: true, reactions: true, comments: true } }),
  ]);
  const sorted = sort === "loved" ? [...posts].sort((a, b) => b.reactions.length - a.reactions.length) : posts;
  const visible = sorted.slice(0, take);
  const next = posts.length > take ? posts[take].id : null;

  return (
    <main className="warm-shell">
      <section className="container space-y-8 py-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-amber-950 text-white shadow-xl">
          <img src={spotlight[0]?.photos?.[0] || fallback} alt="Community rescue story" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950 via-amber-950/70 to-transparent" />
          <div className="relative p-7 sm:p-10"><p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">Spotlight stories</p><h1 className="mt-4 max-w-3xl font-display text-4xl font-bold sm:text-6xl">Stories from the PawPrint family</h1><p className="mt-4 max-w-2xl text-lg text-amber-50">Rescue stories, reunion celebrations, adoption wins, and everyday joy.</p>{session?.user?.id ? <Button asChild className="mt-6"><Link href="/community/new"><PenLine className="size-5" aria-hidden /> Create Post</Link></Button> : <Button asChild className="mt-6"><Link href="/login">Join the community</Link></Button>}</div>
        </section>
        {spotlight.length ? <section className="space-y-3"><h2 className="flex items-center gap-2 text-2xl font-bold"><Sparkles className="size-6 text-[#B45309]" aria-hidden /> Weekly Spotlight</h2><div className="grid gap-4 md:grid-cols-3">{spotlight.map((post) => <Link key={post.id} href={`/community/post/${post.id}`} className="group relative min-h-72 overflow-hidden rounded-3xl shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><img src={post.photos?.[0] || fallback} alt="" className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" /><div className="absolute bottom-0 p-5 text-white"><p className="text-sm font-bold">⭐ Spotlight</p><p className="mt-2 line-clamp-3 font-semibold">{post.content}</p></div></Link>)}</div></section> : null}
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2 text-sm"><Button asChild variant={sort === "newest" ? "default" : "outline"} size="sm"><Link href="/community?sort=newest">Newest</Link></Button><Button asChild variant={sort === "loved" ? "default" : "outline"} size="sm"><Link href="/community?sort=loved">Most Loved</Link></Button><Button asChild variant={sort === "spotlight" ? "default" : "outline"} size="sm"><Link href="/community?sort=spotlight">Spotlight</Link></Button></div>{session?.user?.id ? <Button asChild aria-label="Create a community post" className="fixed bottom-24 right-5 z-30 size-16 rounded-full p-0 shadow-xl md:static md:size-auto md:px-5"><Link href="/community/new"><PenLine className="size-5" aria-hidden /><span className="sr-only md:not-sr-only">Post</span></Link></Button> : null}</div>
        <section className="columns-1 gap-5 md:columns-2 xl:columns-3">{visible.map((post) => <CommunityPostCard key={post.id} post={post} currentUserId={session?.user?.id} />)}</section>
        {next ? <div className="flex justify-center"><Button asChild variant="outline"><Link href={`/community?sort=${sort}&cursor=${next}`}>Load more stories</Link></Button></div> : null}
        {!visible.length ? <EmptyState title="No community stories yet" description="Be the first to share a happy tail, rescue update, or reunion moment." actionHref={session?.user?.id ? "/community/new" : "/login"} actionLabel="Create the first story" icon="🎉" /> : null}
      </section>
    </main>
  );
}
