import { LostFoundBrowse } from "@/components/lost-found/LostFoundBrowse";

export default function LostFoundBrowsePage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  return (
    <main className="container max-w-6xl py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Browse Lost & Found Listings</h1>
        <p className="mt-2 text-muted-foreground">Search by district, type, species, colour, breed, and recent date range.</p>
      </div>
      <LostFoundBrowse searchParams={searchParams ?? {}} />
    </main>
  );
}
