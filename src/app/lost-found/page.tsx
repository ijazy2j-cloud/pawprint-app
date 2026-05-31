export const metadata = { title: "Lost & Found Pets — PawPrint Sri Lanka", description: "Report lost and found pets and browse public listings by district." };

import { getServerSession } from "next-auth";
import { HeartCrack, Search, Sparkles } from "lucide-react";

import { LostFoundForm } from "@/components/lost-found/LostFoundForm";
import { LostFoundBrowse } from "@/components/lost-found/LostFoundBrowse";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authOptions } from "@/lib/auth";

export default async function LostFoundPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const session = await getServerSession(authOptions);
  const defaultContact = { name: session?.user?.name, email: session?.user?.email, phone: undefined, district: session?.user?.district };
  const defaultTab = typeof searchParams?.tab === "string" ? searchParams.tab : "lost";

  return (
    <main className="warm-shell bg-[radial-gradient(circle_at_top_left,#FFE8B5,transparent_35%),#FBF6EC]">
      <section className="container max-w-7xl py-8 sm:py-12">
        <div className="mb-8 rounded-[2rem] bg-white p-7 shadow-sm">
          <p className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-[#92400E]">District-safe matching · contact stays private</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-6xl">Reunite lost pets with their families.</h1>
          <p className="mt-3 max-w-3xl text-lg text-[#6B5847]">Post a missing pet, report a found animal, browse alerts, and discover possible matches without exposing precise GPS publicly.</p>
        </div>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid h-auto w-full gap-2 rounded-full bg-white p-2 shadow-sm sm:grid-cols-3">
            <TabsTrigger value="lost" className="min-h-12 rounded-full data-[state=active]:bg-[#B45309] data-[state=active]:text-white"><HeartCrack className="mr-2 size-4" aria-hidden /> I Lost a Pet</TabsTrigger>
            <TabsTrigger value="found" className="min-h-12 rounded-full data-[state=active]:bg-[#B45309] data-[state=active]:text-white"><Sparkles className="mr-2 size-4" aria-hidden /> I Found a Pet</TabsTrigger>
            <TabsTrigger value="browse" className="min-h-12 rounded-full data-[state=active]:bg-[#B45309] data-[state=active]:text-white"><Search className="mr-2 size-4" aria-hidden /> Browse Listings</TabsTrigger>
          </TabsList>
          <TabsContent value="lost" className="mt-6"><LostFoundForm mode="LOST" defaultContact={defaultContact} /></TabsContent>
          <TabsContent value="found" className="mt-6"><LostFoundForm mode="FOUND" defaultContact={defaultContact} /></TabsContent>
          <TabsContent value="browse" className="mt-6"><LostFoundBrowse searchParams={searchParams ?? {}} /></TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
