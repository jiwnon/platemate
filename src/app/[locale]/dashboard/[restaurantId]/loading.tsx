export default function DashboardRestaurantLoading() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex justify-between">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
        <div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 mb-3" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-xl border border-gray-200 bg-white animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
