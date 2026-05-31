import Link from "next/link";

import { CommentForm, ReportCommentForm } from "@/components/community/Comments";
import { PhotoCarousel, StoryText } from "@/components/community/PostMedia";
import { ReactionBar } from "@/components/community/ReactionBar";
import { ShareButtons } from "@/components/sos/ShareButtons";
import { countReactions, relativeTime, transformCloudinaryUrl, type CommunityReactionType } from "@/lib/community/helpers";

const tagStyles: Record<string, string> = { RESCUE: "bg-red-100 text-red-800", ADOPTION: "bg-emerald-100 text-emerald-800", REUNION: "bg-blue-100 text-blue-800", DAILY_JOY: "bg-amber-100 text-amber-800" };
const tagLabels: Record<string, string> = { RESCUE: "Rescue", ADOPTION: "Adoption", REUNION: "Reunion", DAILY_JOY: "Daily Joy" };

export function CommunityPostCard({ post, currentUserId, showComments = false }: { post: any; currentUserId?: string; showComments?: boolean }) {
  const counts = countReactions(post.reactions ?? []);
  const mine = (post.reactions ?? []).find((reaction: any) => reaction.userId === currentUserId)?.type as CommunityReactionType | null;
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/community/post/${post.id}`;
  const photos = (post.photos ?? []).map(transformCloudinaryUrl);
  return (
    <article className="paw-card mb-5 break-inside-avoid overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-full bg-amber-100 text-xl" aria-hidden>🐾</div><div><h3 className="font-bold">{post.author?.name ?? "PawPrint friend"}</h3><p className="text-xs text-[#6B5847]">{relativeTime(new Date(post.createdAt))}</p></div></div>{post.tag ? <span className={`rounded-full px-2 py-1 text-xs font-bold ${tagStyles[post.tag]}`}>{tagLabels[post.tag]}</span> : null}</div>
      <div className="px-4"><PhotoCarousel photos={photos} alt={`Story shared by ${post.author?.name ?? "a PawPrint friend"}`} /></div>
      <div className="space-y-4 p-4"><StoryText content={post.content} /><ReactionBar postId={post.id} counts={counts} mine={mine} loggedIn={Boolean(currentUserId)} /><div className="flex flex-wrap items-center gap-3 text-sm"><Link className="font-bold text-[#6B5847] hover:text-[#B45309]" href={`/community/post/${post.id}`}>💬 {post.comments?.length ?? 0} comments</Link><ShareButtons url={url} text={`Check out this story on PawPrint Sri Lanka 🐾`} /></div>{showComments ? <div className="space-y-3 border-t pt-3">{post.comments?.map((comment: any) => <div key={comment.id} className="rounded-2xl bg-[#F4EEE2] p-3 text-sm"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{comment.author?.name ?? "PawPrint friend"}</p><p className="text-xs text-[#6B5847]">{relativeTime(new Date(comment.createdAt))}</p></div><ReportCommentForm commentId={comment.id} /></div><p className="mt-2 whitespace-pre-wrap">{comment.content}</p></div>)}{currentUserId ? <CommentForm postId={post.id} /> : <Link href="/login" className="text-sm font-bold text-[#B45309]">Login to comment</Link>}</div> : null}</div>
    </article>
  );
}
