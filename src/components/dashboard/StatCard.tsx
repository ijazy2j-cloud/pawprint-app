import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const tones: Record<string, string> = { amber: "bg-amber-100 text-[#92400E]", green: "bg-lime-100 text-[#3F6212]", blue: "bg-sky-100 text-sky-800", rose: "bg-rose-100 text-[#BE123C]" };
export function StatCard({ title, value, note, tone = "amber" }: { title: string; value: string | number; note?: string; tone?: "amber" | "green" | "blue" | "rose" }) {
  return <Card className="overflow-hidden"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-bold uppercase tracking-wide text-[#6B5847]">{title}</p><p className="mt-3 text-4xl font-bold tabular-nums text-[#241712]">{value}</p></div><span className={`grid size-11 place-items-center rounded-2xl ${tones[tone]}`}><ArrowUpRight className="size-5" aria-hidden /></span></div>{note ? <p className="mt-3 text-sm text-[#6B5847]">{note}</p> : <p className="mt-3 text-sm text-[#3F6212]">↗ helping more paws</p>}</CardContent></Card>;
}
