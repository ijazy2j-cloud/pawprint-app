import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { CommunityPostForm } from "@/components/community/CommunityPostForm";
import { authOptions } from "@/lib/auth";

export default async function NewCommunityPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  return (
    <main className="container max-w-3xl space-y-6 py-8">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Happy Tails</p><h1 className="text-3xl font-bold">Create a community story</h1><p className="mt-2 text-muted-foreground">Share a rescue, adoption, reunion, or daily joy moment. Links are blocked to keep the space safe.</p></div>
      <CommunityPostForm />
    </main>
  );
}
