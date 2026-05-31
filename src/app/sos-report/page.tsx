export const metadata = { title: "Report an Animal in Need — PawPrint Sri Lanka", description: "Send an urgent rescue alert for injured, abandoned, lost, or stray animals in Sri Lanka." };

import { getServerSession } from "next-auth";
import { Siren } from "lucide-react";

import { SosReportForm } from "@/components/sos/SosReportForm";
import { authOptions } from "@/lib/auth";

export default async function SosReportPage() {
  const session = await getServerSession(authOptions);
  return (
    <main className="warm-shell bg-[radial-gradient(circle_at_top_left,#FFE8B5,transparent_32%),#FBF6EC]">
      <section className="container max-w-4xl py-8 sm:py-12">
        <div className="mb-8 rounded-[2rem] bg-gradient-to-br from-[#BE123C] via-[#B45309] to-amber-600 p-7 text-white shadow-[0_12px_32px_rgba(190,18,60,.25)]">
          <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-bold uppercase tracking-wide backdrop-blur"><Siren className="mr-2 size-4" aria-hidden /> Urgent rescue alert</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-6xl">Report an Animal in Need</h1>
          <p className="mt-4 max-w-2xl text-lg text-amber-50">Add photos, pin the location, and send a fast alert to the rescue network. Exact GPS stays private for trusted responders.</p>
        </div>
        <SosReportForm defaultContact={{ name: session?.user?.name, email: session?.user?.email, district: session?.user?.district }} />
      </section>
    </main>
  );
}
