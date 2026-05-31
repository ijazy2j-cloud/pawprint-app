export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: count }).map((_, i) => <div key={i} className="h-72 rounded-3xl shimmer" />)}</div>;
}
