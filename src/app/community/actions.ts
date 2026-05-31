"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadCommunityImage } from "@/lib/community/images";
import { communityCommentSchema, communityPostSchema, communityReactionSchema, reportCommentSchema } from "@/lib/community/validation";

export type CommunityActionState = { ok: boolean; error?: string; postId?: string };

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Sign in required.");
  return session;
}

export async function createCommunityPost(_previous: CommunityActionState, formData: FormData): Promise<CommunityActionState> {
  try {
    const session = await requireSession();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.communityPost.count({ where: { authorId: session.user.id, createdAt: { gte: since } } });
    if (recentCount >= 5) return { ok: false, error: "You've reached your daily post limit. Come back tomorrow! 🐾" };

    const files = formData.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0);
    if (files.length > 3) return { ok: false, error: "Max 3 photos per community post." };
    if (files.some((file) => file.size > 5 * 1024 * 1024)) return { ok: false, error: "Each community photo must be 5MB or smaller." };
    const photos = await Promise.all(files.map(uploadCommunityImage));

    const parsed = communityPostSchema.parse({ content: formData.get("content"), tag: formData.get("tag") || undefined, photos });
    const post = await prisma.communityPost.create({ data: { content: parsed.content, photos: parsed.photos, tag: parsed.tag, authorId: session.user.id } });
    revalidatePath("/community");
    return { ok: true, postId: post.id };
  } catch (error) {
    console.error(error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not create community post." };
  }
}

export async function addCommunityComment(postId: string, _previous: CommunityActionState, formData: FormData): Promise<CommunityActionState> {
  try {
    const session = await requireSession();
    const parsed = communityCommentSchema.parse({ content: formData.get("content") });
    await prisma.comment.create({ data: { postId, authorId: session.user.id, content: parsed.content } });
    revalidatePath("/community");
    revalidatePath(`/community/post/${postId}`);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not add comment." };
  }
}

export async function toggleCommunityReaction(postId: string, type: "LOVE" | "CELEBRATE" | "PAWPRINT") {
  const session = await requireSession();
  const parsed = communityReactionSchema.parse({ type });
  const existing = await prisma.reaction.findUnique({ where: { userId_postId: { userId: session.user.id, postId } } });
  if (existing?.type === parsed.type) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.reaction.update({ where: { id: existing.id }, data: { type: parsed.type } });
  } else {
    await prisma.reaction.create({ data: { postId, userId: session.user.id, type: parsed.type } });
  }
  revalidatePath("/community");
  revalidatePath(`/community/post/${postId}`);
}

export async function reportCommunityComment(commentId: string, _previous: CommunityActionState, formData: FormData): Promise<CommunityActionState> {
  try {
    await requireSession();
    const parsed = reportCommentSchema.parse({ reason: formData.get("reason") });
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({ userId: admin.id, type: "COMMENT_REPORT", relatedCommentId: commentId, message: `Community comment reported: ${parsed.reason}` })),
      });
    }
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not report comment." };
  }
}

export async function toggleSpotlightPost(formData: FormData) {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") throw new Error("Admin only.");
  const postId = String(formData.get("postId") ?? "");
  const spotlight = String(formData.get("spotlight") ?? "false") === "true";
  await prisma.communityPost.update({ where: { id: postId }, data: { isSpotlight: spotlight, spotlightAt: spotlight ? new Date() : null } });
  revalidatePath("/community");
  revalidatePath("/admin/community");
}

export async function removeCommunityPost(formData: FormData) {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") throw new Error("Admin only.");
  const postId = String(formData.get("postId") ?? "");
  await prisma.communityPost.delete({ where: { id: postId } });
  revalidatePath("/community");
  revalidatePath("/admin/community");
}

export async function goToNewCommunityPost() {
  redirect("/community/new");
}
