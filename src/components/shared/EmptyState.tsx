import Link from "next/link";
import { PawPrint } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({ title, description, actionHref, actionLabel, icon = "🐾" }: { title: string; description: string; actionHref?: string; actionLabel?: string; icon?: string }) {
  return (
    <div className="paw-card grid place-items-center p-8 text-center">
      <div className="relative mb-4 grid size-20 place-items-center rounded-full bg-[#F4EEE2] text-4xl" aria-hidden>
        {icon}<PawPrint className="absolute -right-1 -top-1 size-6 text-[#B45309]" />
      </div>
      <h3 className="text-xl font-bold text-[#241712]">{title}</h3>
      <p className="mt-2 max-w-md text-[#6B5847]">{description}</p>
      {actionHref && actionLabel ? <Button asChild className="mt-5"><Link href={actionHref}>{actionLabel}</Link></Button> : null}
    </div>
  );
}
