"use client";

import { useState, useTransition } from "react";

import { addCommunityComment, reportCommunityComment, type CommunityActionState } from "@/app/community/actions";
import { Button } from "@/components/ui/button";

export function CommentForm({ postId }: { postId: string }) {
  const [state, setState] = useState<CommunityActionState>({ ok: false });
  const [pending, startTransition] = useTransition();
  function submit(formData: FormData) {
    setState({ ok: false });
    startTransition(async () => setState(await addCommunityComment(postId, { ok: false }, formData)));
  }
  return <form action={submit} className="mt-3 flex gap-2"><label htmlFor={`comment-${postId}`} className="sr-only">Add a comment</label><textarea id={`comment-${postId}`} name="content" maxLength={300} required rows={2} className="min-w-0 flex-1 rounded-md border p-2 text-sm" placeholder="Add a kind comment..." /><Button disabled={pending}>{pending ? "Sending" : "Comment"}</Button>{state.error ? <p role="alert" className="text-xs font-semibold text-[#BE123C]">{state.error}</p> : null}</form>;
}

export function ReportCommentForm({ commentId }: { commentId: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<CommunityActionState>({ ok: false });
  const [pending, startTransition] = useTransition();
  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await reportCommunityComment(commentId, { ok: false }, formData);
      setState(result);
      if (result.ok) setOpen(false);
    });
  }
  if (!open) return <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setOpen(true)}>⚑ Report</button>;
  return <form action={submit} className="mt-2 space-y-2 rounded-lg border p-2"><p className="text-xs font-semibold">Report this comment?</p><label htmlFor={`report-${commentId}`} className="sr-only">Reason for reporting</label><input id={`report-${commentId}`} name="reason" required placeholder="Reason" className="w-full rounded-md border p-2 text-xs" /><div className="flex gap-2"><Button size="sm" disabled={pending}>Submit</Button><Button size="sm" type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>{state.error ? <p role="alert" className="text-xs font-semibold text-[#BE123C]">{state.error}</p> : null}</form>;
}
