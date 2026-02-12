export default function OrderLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 스켈레톤 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="mt-2 h-4 w-20 animate-pulse rounded bg-gray-100" />
      </div>
      {/* 탭 스켈레톤 */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-16 shrink-0 animate-pulse rounded-full bg-gray-200" />
        ))}
      </div>
      {/* 그리드 스켈레톤 */}
      <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="aspect-square animate-pulse bg-gray-200" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
      {/* 하단 바 스켈레톤 */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-11 w-28 animate-pulse rounded-xl bg-primary-200" />
        </div>
      </div>
    </div>
  );
}
