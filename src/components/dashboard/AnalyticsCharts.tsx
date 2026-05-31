"use client";

import dynamic from "next/dynamic";

// Defer recharts to the client and code-split it out of the analytics route's
// initial/SSR bundle. Fallbacks reserve the chart height to avoid layout shift.
const fallback = () => <div className="h-72 rounded-2xl border border-[#E4D9C6] bg-card shimmer" />;

export const SimpleBarChart = dynamic(() => import("./Charts").then((m) => m.SimpleBarChart), { ssr: false, loading: fallback });
export const SimpleLineChart = dynamic(() => import("./Charts").then((m) => m.SimpleLineChart), { ssr: false, loading: fallback });
export const SimpleAreaChart = dynamic(() => import("./Charts").then((m) => m.SimpleAreaChart), { ssr: false, loading: fallback });
