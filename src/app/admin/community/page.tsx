import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { removeCommunityPost, toggleSpotlightPost } from "@/app/community/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminCommunityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  const posts = await prisma.communityPost.findMany({ include: { author: true, comments: true, reactions: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <main className="container space-y-6 py-8">
      <div><h1 className="text-3xl font-bold">Community moderation</h1><p className="text-muted-foreground">Pin spotlight stories or remove unsafe posts.</p></div>
      <div className="space-y-3">{posts.map((post) => <Card key={post.id}><CardContent className="grid gap-4 p-4 md:grid-cols-[120px_1fr_auto]"><div>{post.photos[0] ? <img src={post.photos[0]} alt="Post" className="h-24 w-full rounded-xl object-cover" /> : <div className="flex h-24 items-center justify-center rounded-xl bg-muted">🐾</div>}</div><div className="space-y-1 text-sm"><p className="font-semibold">{post.author.name ?? post.author.email}</p><p className="line-clamp-2 text-muted-foreground">{post.content}</p><p>{post.createdAt.toLocaleDateString()} • {post.isSpotlight ? "Spotlight" : "Not pinned"}</p><Link href={`/community/post/${post.id}`} className="text-primary">Open post</Link></div><div className="flex flex-col gap-2"><form action={toggleSpotlightPost}><input type="hidden" name="postId" value={post.id} /><input type="hidden" name="spotlight" value={post.isSpotlight ? "false" : "true"} /><Button variant="outline">{post.isSpotlight ? "Unpin" : "Pin"}</Button></form><form action={removeCommunityPost}><input type="hidden" name="postId" value={post.id} /><Button variant="destructive">Remove</Button></form></div></CardContent></Card>)}</div>
    </main>
  );
}
