"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function RevealContact({ phone, email }: { phone?: string | null; email?: string | null }) {
  const [shown, setShown] = useState(false);

  function mask(value?: string | null) {
    const contact = (value ?? "").trim();
    if (!contact) return "Not provided";
    if (contact.includes("@")) {
      const [name, domain] = contact.split("@");
      return `${name.slice(0, 2)}••••@${domain}`;
    }
    return contact.length > 5 ? `${contact.slice(0, 3)}••••••${contact.slice(-2)}` : "••••";
  }

  return (
    <div className="rounded-xl border border-[#E4D9C6] bg-[#F4EEE2] p-3 text-sm">
      <p className="font-semibold text-[#241712]">Contact</p>
      <p className="mt-1 text-[#6B5847]">Phone: {shown ? phone || "Not provided" : mask(phone)}</p>
      {email ? <p className="text-[#6B5847]">Email: {shown ? email : mask(email)}</p> : null}
      {!shown ? <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setShown(true)}>Reveal Contact</Button> : null}
    </div>
  );
}
