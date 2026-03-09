export default function TablesLoading() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="flex justify-end">
          <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
