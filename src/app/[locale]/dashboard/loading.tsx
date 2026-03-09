export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-lg">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
