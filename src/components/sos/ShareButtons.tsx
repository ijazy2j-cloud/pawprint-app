"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { facebookShareUrl, whatsappShareUrl } from "@/lib/social/share";

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" size="sm">
        <a href={whatsappShareUrl(text.includes(url) ? text : `${text} ${url}`)} target="_blank" rel="noreferrer">WhatsApp</a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={facebookShareUrl(url)} target="_blank" rel="noreferrer">Facebook</a>
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={copyLink}>{copied ? "Link copied! Share the love 🐾" : "Copy link"}</Button>
      <span aria-live="polite" className="sr-only">{copied ? "Link copied to clipboard" : ""}</span>
    </div>
  );
}
