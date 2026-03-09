export default function NewRestaurantLoading() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-md">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200 mb-6" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-100 mb-6" />
        <div className="h-72 rounded-xl border border-gray-200 bg-white animate-pulse" />
      </div>
    </main>
  );
}
