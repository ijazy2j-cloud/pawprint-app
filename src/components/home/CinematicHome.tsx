"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronDown, HeartHandshake, PawPrint, Siren } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type RescueCard = { id: string; photo: string; name: string; district: string; status: string; description: string; href: string; time: string };
type StoryCard = { id: string; photo: string; quote: string; author: string; href: string; hearts: number };
type HomeData = { rescuedMonth: number; reunitedMonth: number; activeAlerts: number; volunteers: number; recentRescues: RescueCard[]; stories: StoryCard[]; ticker: string[] };

const hero = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&q=80";
const dog = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800";
const vet = "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800";
const cat = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800";
const ease = [0.22, 1, 0.36, 1] as const;
// Warm amber/earth sheen for the hero heading — a bright cream band sweeping over amber.
const heroShimmer =
  "linear-gradient(105deg, #F6B864 0%, #F6B864 38%, #FFF7E8 50%, #FCD49B 58%, #F6B864 72%, #F6B864 100%)";

// A few soft, slow-floating paw motifs for warmth — purely decorative, motion-safe.
function FloatingPaws({ reduced }: { reduced: boolean | null }) {
  const paws = [
    { top: "16%", left: "7%", size: 72, rot: -18, dur: 11, delay: 0 },
    { top: "60%", left: "13%", size: 52, rot: 12, dur: 13, delay: 1.4 },
    { top: "26%", left: "83%", size: 92, rot: 20, dur: 14, delay: 0.7 },
    { top: "70%", left: "78%", size: 60, rot: -10, dur: 12, delay: 2.1 },
    { top: "44%", left: "48%", size: 46, rot: 8, dur: 15, delay: 1.1 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {paws.map((p, i) => (
        <motion.div
          key={i}
          className="absolute text-[#F6B864]"
          style={{ top: p.top, left: p.left, opacity: 0.1, rotate: p.rot }}
          initial={false}
          animate={reduced ? undefined : { y: [0, -24, 0], rotate: [p.rot, p.rot + 6, p.rot] }}
          transition={reduced ? undefined : { duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        >
          <PawPrint style={{ width: p.size, height: p.size }} />
        </motion.div>
      ))}
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  return <motion.div ref={ref} className={className} initial={reduced ? false : { opacity: 0, y: 24 }} animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ duration: 0.7, delay, ease }}>{children}</motion.div>;
}

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!inView) return;
    if (reduced) { setCount(value); return; }
    let start = 0;
    const end = Math.max(value, 0);
    const duration = 1200;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => { const p = Math.min((now - started) / duration, 1); start = Math.round(end * (1 - Math.pow(1 - p, 3))); setCount(start); if (p < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, value]);
  return <span ref={ref} className="tabular-nums">{count}</span>;
}

function CinematicHero({ data }: { data: HomeData }) {
  const words = "Every Paw Matters".split(" ");
  const reduced = useReducedMotion();
  // Gentle staggered entrance — disabled entirely for reduced-motion users.
  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: reduced ? 0 : delay, ease },
  });
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#241712] text-white">
      <Image src={hero} alt="A rescued dog being held gently in warm sunlight" fill priority sizes="100vw" className="object-cover md:fixed" />
      <div className="absolute inset-0" aria-hidden style={{ background: "linear-gradient(135deg, rgba(36,23,18,0.88) 0%, rgba(180,83,9,0.42) 100%)" }} />
      <FloatingPaws reduced={reduced} />
      <div className="container relative z-10 flex min-h-screen flex-col justify-center pt-24">
        <motion.p {...rise(0)} className="mb-5 w-fit rounded-full bg-white/10 px-5 py-2 text-sm font-bold uppercase tracking-[0.22em] text-amber-100 backdrop-blur">Free rescue network • Sri Lanka</motion.p>
        <h1 className="max-w-5xl font-display text-5xl font-bold leading-[1.05] tracking-[-0.02em] md:text-7xl lg:text-8xl">
          {words.map((word, idx) => (
            <motion.span
              key={word}
              className="mr-4 inline-block"
              style={
                reduced
                  ? { color: "#F6B864" }
                  : { backgroundImage: heroShimmer, backgroundSize: "250% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }
              }
              initial={reduced ? false : { opacity: 0, y: 30 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, backgroundPositionX: ["0%", "200%"] }}
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      opacity: { duration: 0.8, delay: idx * 0.12, ease },
                      y: { duration: 0.8, delay: idx * 0.12, ease },
                      backgroundPositionX: { duration: 6, repeat: Infinity, repeatType: "loop", ease: "linear", delay: 1.2 },
                    }
              }
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p {...rise(0.55)} className="mt-6 max-w-3xl text-xl leading-relaxed text-amber-50 md:text-2xl">A non-profit rescue network connecting compassionate people with animals in need across Sri Lanka.</motion.p>
        <motion.div {...rise(0.85)} className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="rounded-full bg-[#BE123C] px-8 text-base text-white shadow-[0_8px_24px_rgba(190,18,60,.35)] hover:scale-105 hover:bg-rose-800 hover:shadow-xl"><Link href="/sos-report"><Siren className="size-5" aria-hidden /> Report an Emergency</Link></Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-white/75 bg-transparent px-8 text-base text-white hover:scale-105 hover:bg-white hover:text-[#241712]"><Link href="/adopt"><HeartHandshake className="size-5" aria-hidden /> Adopt a Pet</Link></Button>
          <Link href="/community" className="group min-h-12 px-2 py-3 font-bold text-white underline-offset-8 hover:underline">See Success Stories <span aria-hidden className="transition group-hover:translate-x-1">→</span></Link>
        </motion.div>
        <LiveRescueTicker ticker={data.ticker} />
      </div>
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-center text-sm text-white/75 md:block" aria-hidden><span>Scroll to explore</span><ChevronDown className="mx-auto mt-2 size-6 animate-scroll-bounce" /></div>
    </section>
  );
}

function LiveRescueTicker({ ticker }: { ticker: string[] }) {
  const items = ticker.length ? ticker : ["Rex rescued in Colombo", "Luna reunited in Kandy", "47 adoptions this month"];
  const doubled = [...items, ...items];
  return (
    <section aria-label="Live rescue updates" className="mt-10 overflow-hidden rounded-full bg-[#B45309]/20 py-2 text-[#FCD49B] backdrop-blur">
      {/* visual marquee hidden from SR to avoid duplicate reading */}
      <div aria-hidden className="animate-rescue-ticker flex w-max gap-10 whitespace-nowrap px-6">{doubled.map((item, idx) => <span key={`${item}-${idx}`} className="text-sm font-semibold">{item}</span>)}</div>
      <ul className="sr-only">{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}

function StoryStepCards() {
  const cards = [
    { n: "01", title: "See something? Say something.", body: "Spot an injured or abandoned animal? Snap a photo, pin the location, and alert verified NGOs in seconds. No app download needed.", image: dog, href: "/sos-report", cta: "Report Now →" },
    { n: "02", title: "NGOs respond. Volunteers mobilize.", body: "Our network of verified rescuers gets instant alerts with precise locations. No animal is too far, no case too small.", image: vet, href: "/dashboard", cta: "Join the response →" },
    { n: "03", title: "Forever homes. Zero fees.", body: "Adoption is always free. Every pet deserves love, not a price tag. Browse, apply, and welcome a new family member.", image: cat, href: "/adopt", cta: "Meet them →" },
  ];
  return <section className="bg-[#FBF6EC] py-24"><div className="container"><Reveal className="mx-auto max-w-3xl text-center"><h2 className="font-display text-4xl font-semibold text-[#241712] md:text-5xl">How PawPrint Works</h2><p className="mt-4 text-lg leading-relaxed text-[#6B5847]">A simple chain of care: one witness, one alert, one rescue team, one second chance.</p></Reveal><div className="mt-12 grid gap-6 md:grid-cols-3">{cards.map((card, idx) => <Reveal key={card.n} delay={idx * .1}><PhotoCard {...card} /></Reveal>)}</div></div></section>;
}

function PhotoCard({ n, title, body, image, href, cta }: { n: string; title: string; body: string; image: string; href: string; cta: string }) {
  return <Link href={href} className="group relative block h-96 overflow-hidden rounded-2xl bg-[#241712] shadow-xl"><Image src={image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 ease-out group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#241712]/95 via-[#241712]/35 to-transparent transition group-hover:from-[#241712]/85" /><span aria-hidden className="absolute left-5 top-4 font-display text-8xl font-bold text-[#D97706] opacity-20">{n}</span><div className="absolute bottom-0 p-6 text-white transition duration-500 group-hover:-translate-y-2"><h3 className="font-display text-3xl font-semibold">{title}</h3><p className="mt-3 leading-relaxed text-white/85">{body}</p><span className="mt-5 inline-flex font-semibold text-[#FCD49B]">{cta}</span></div></Link>;
}

function ImpactSection({ data }: { data: HomeData }) {
  return <section className="bg-[#241712] py-24 text-[#FBF6EC]"><div className="container"><Reveal className="text-center"><h2 className="font-display text-4xl font-semibold md:text-5xl">This Month&apos;s Impact</h2><p className="mt-3 text-lg text-[#FBF6EC]/80">Real records from PawPrint activity — quiet work, visible change.</p></Reveal><div className="mt-12 grid gap-8 text-center md:grid-cols-3">{[[data.rescuedMonth, "Animals Rescued"], [data.reunitedMonth, "Families Reunited"], [data.volunteers, "Active Volunteers"]].map(([value, label]) => <Reveal key={label as string}><p className="text-6xl font-bold text-[#F6B864]"><AnimatedCounter value={value as number} /></p><p className="mt-2 text-lg text-[#FBF6EC]/85">{label}</p></Reveal>)}</div><div className="mt-14 flex snap-x gap-5 overflow-x-auto pb-4">{data.recentRescues.map((card) => <Link key={card.id} href={card.href} className="min-w-[290px] snap-start overflow-hidden rounded-3xl bg-white/10 transition hover:-translate-y-1 hover:bg-white/15"><div className="relative h-48"><Image src={card.photo} alt={`${card.name} in ${card.district}`} fill sizes="290px" className="object-cover" /></div><div className="p-5"><p className="font-display text-2xl font-semibold">{card.name}</p><p className="mt-1 text-sm text-[#FBF6EC]/75">{card.district}</p><span className="mt-4 inline-flex rounded-full bg-[#65A30D]/25 px-3 py-1 text-xs font-semibold text-lime-100">{card.status} • {card.time}</span></div></Link>)}</div></div></section>;
}

function UrgentSosStrip({ count }: { count: number }) {
  return <section aria-label="Active SOS alerts" className="sticky bottom-20 z-40 bg-[#B45309] py-4 text-white shadow-2xl md:static md:bottom-auto"><div className="container flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><p className="flex items-center gap-3 text-lg font-bold"><span aria-hidden className={`size-3 rounded-full ${count ? "animate-ping bg-[#E11D48]" : "bg-[#A3E635]"}`} /><span>{count ? `${count} animals need help right now` : "All caught up — no active SOS alerts."}</span></p><Button asChild className="rounded-full bg-white text-[#B45309] hover:bg-[#FBF6EC]"><Link href="/sos-report">View SOS Alerts <span aria-hidden>→</span></Link></Button></div></section>;
}

function SuccessStories({ stories }: { stories: StoryCard[] }) {
  const fallback: StoryCard[] = [
    { id: "fallback-1", photo: dog, quote: "I thought I would never see Milo again. PawPrint changed that.", author: "Sarah, Colombo", href: "/community", hearts: 18 },
    { id: "fallback-2", photo: cat, quote: "She arrived scared. Tonight she is asleep on our sofa.", author: "A foster family", href: "/community", hearts: 12 },
    { id: "fallback-3", photo: vet, quote: "One alert brought food, transport, and a vet visit before sunset.", author: "Volunteer note", href: "/community", hearts: 9 },
  ];
  const list = stories.length ? stories : fallback;
  return <section className="bg-[#FBF6EC] py-24"><div className="container"><Reveal className="mb-10"><h2 className="font-display text-4xl font-semibold md:text-5xl">Happy Tails</h2><p className="mt-3 text-lg text-[#6B5847]">Real stories from real rescues.</p></Reveal><div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]"><Reveal><Link href={list[0].href} className="group relative block min-h-[520px] overflow-hidden rounded-[2rem] bg-[#241712]"><Image src={list[0].photo} alt="" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#241712]/90 via-[#241712]/30 to-transparent" /><blockquote className="absolute bottom-0 p-8 text-white"><p className="font-display text-3xl font-semibold md:text-4xl">“{list[0].quote}”</p><footer className="mt-4 text-[#FCD49B]">— {list[0].author}</footer></blockquote></Link></Reveal><div className="grid gap-6">{list.slice(1, 3).map((story, idx) => <Reveal key={story.id} delay={idx * .1}><Link href={story.href} className="group grid overflow-hidden rounded-[2rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:grid-cols-[220px_1fr]"><div className="relative min-h-56"><Image src={story.photo} alt="" fill sizes="220px" className="object-cover transition duration-700 group-hover:scale-105" /></div><div className="p-6"><p className="font-display text-2xl font-semibold text-[#241712]">“{story.quote}”</p><p className="mt-3 text-sm font-semibold text-[#B45309]">{story.hearts} hearts • Read more →</p></div></Link></Reveal>)}</div></div><div className="mt-10 text-center"><Button asChild className="rounded-full bg-[#B45309] px-8 text-white hover:bg-[#92400E]"><Link href="/community">Share Your Story</Link></Button></div></div></section>;
}

export function CinematicHome({ data }: { data: HomeData }) {
  return <main className="warm-shell"><CinematicHero data={data} /><StoryStepCards /><ImpactSection data={data} /><UrgentSosStrip count={data.activeAlerts} /><SuccessStories stories={data.stories} /></main>;
}
