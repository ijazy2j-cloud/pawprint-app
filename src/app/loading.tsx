export default function Loading() {
  return (
    <main className="warm-shell">
      <section className="container space-y-6 py-10">
        <div className="h-64 rounded-[2rem] shimmer" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-44 rounded-3xl shimmer" />
          <div className="h-44 rounded-3xl shimmer" />
          <div className="h-44 rounded-3xl shimmer" />
        </div>
      </section>
    </main>
  );
}
