export default function LoginLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200 mb-6" />
        <div className="space-y-4">
          <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-11 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </main>
  );
}
