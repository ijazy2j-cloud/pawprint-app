"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";

const grid = "#E4D9C6";
const axisTick = { fill: "#6B5847", fontSize: 12 };

export function SimpleBarChart({ data, xKey, yKey }: { data: any[]; xKey: string; yKey: string }) {
  return <div className="h-72 rounded-2xl border border-[#E4D9C6] bg-card p-4" role="img" aria-label={`Bar chart of ${yKey} by ${xKey}`}><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke={grid}/><XAxis dataKey={xKey} tick={axisTick}/><YAxis tick={axisTick}/><Tooltip/><Bar dataKey={yKey} fill="#4D7C0F" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
export function SimpleLineChart({ data, xKey, yKey }: { data: any[]; xKey: string; yKey: string }) {
  return <div className="h-72 rounded-2xl border border-[#E4D9C6] bg-card p-4" role="img" aria-label={`Line chart of ${yKey} over ${xKey}`}><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke={grid}/><XAxis dataKey={xKey} tick={axisTick}/><YAxis tick={axisTick}/><Tooltip/><Line type="monotone" dataKey={yKey} stroke="#0E7490" strokeWidth={2} /></LineChart></ResponsiveContainer></div>;
}
export function SimpleAreaChart({ data, xKey, yKey }: { data: any[]; xKey: string; yKey: string }) {
  return <div className="h-72 rounded-2xl border border-[#E4D9C6] bg-card p-4" role="img" aria-label={`Area chart of ${yKey} over ${xKey}`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><CartesianGrid strokeDasharray="3 3" stroke={grid}/><XAxis dataKey={xKey} tick={axisTick}/><YAxis tick={axisTick}/><Tooltip/><Area type="monotone" dataKey={yKey} fill="#F6B864" stroke="#B45309" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>;
}
