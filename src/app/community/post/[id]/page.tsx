import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { authOptions } from "@/lib/auth";
import { transformCloudinaryUrl } from "@/lib/community/helpers";
import { prisma } from "@/lib/prisma";
import { absoluteOgImageUrl } from "@/lib/social/og";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await prisma.communityPost.findUnique({ where: { id: params.id }, select: { id: true, content: true, photos: true } });
  if (!post) return { title: "Community story not found" };
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/community/post/${post.id}`;
  const description = post.content.slice(0, 160);
  const ogImage = absoluteOgImageUrl(process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000", { type: "community", title: "Happy Tail on PawPrint Sri Lanka", photo: post.photos[0] ? transformCloudinaryUrl(post.photos[0]) : undefined, district: "Sri Lanka", status: "COMMUNITY" });
  return { title: "Happy Tail on PawPrint Sri Lanka", description, openGraph: { title: "Happy Tail on PawPrint Sri Lanka", description, url, images: [{ url: ogImage, alt: "Happy Tail on PawPrint Sri Lanka" }] } };
}

export default async function CommunityPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const post = await prisma.communityPost.findUnique({ where: { id: params.id }, include: { author: true, reactions: true, comments: { include: { author: true }, orderBy: { createdAt: "asc" } } } });
  if (!post) notFound();
  return (
    <main className="container max-w-3xl space-y-6 py-8">
      <Link href="/community" className="text-sm text-muted-foreground hover:text-foreground">← Back to Happy Tails</Link>
      <CommunityPostCard post={post} currentUserId={session?.user?.id} showComments />
    </main>
  );
}
