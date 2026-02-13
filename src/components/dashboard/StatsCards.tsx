'use client';

export type DashboardStats = {
  todayOrderCount: number;
  todayRevenue: number;
  todayAvg: number;
};

type Props = {
  stats: DashboardStats;
};

export function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: '오늘 주문',
      value: stats.todayOrderCount,
      suffix: '건',
      className: 'border-blue-200 bg-blue-50/50',
    },
    {
      label: '오늘 매출',
      value: stats.todayRevenue.toLocaleString(),
      suffix: '원',
      className: 'border-emerald-200 bg-emerald-50/50',
    },
    {
      label: '평균 객단가',
      value: stats.todayAvg.toLocaleString(),
      suffix: '원',
      className: 'border-amber-200 bg-amber-50/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 ${card.className}`}
        >
          <p className="text-sm font-medium text-gray-600">{card.label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {card.value}
            <span className="ml-1 text-base font-normal text-gray-600">{card.suffix}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
