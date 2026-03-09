'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StatsCards, type DashboardStats } from './StatsCards';
import { OrderCard, type DashboardOrder } from './OrderCard';
import { WeeklyReportButton } from './WeeklyReportButton';

type Props = {
  restaurantId: string;
  locale: string;
};

type DashboardData = {
  pendingOrders: DashboardOrder[];
  stats: DashboardStats;
};

async function fetchDashboard(restaurantId: string): Promise<DashboardData> {
  const res = await fetch(`/api/dashboard/${restaurantId}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export function DashboardContent({ restaurantId, locale }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchDashboard(restaurantId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`orders:${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, load]);

  const handleComplete = useCallback(
    async (orderId: string) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to update');
      }
      load();
    },
    [load]
  );

  if (loading && !data) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <p className="text-gray-500">대시보드를 불러오는 중…</p>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  const { pendingOrders = [], stats = { todayOrderCount: 0, todayRevenue: 0, todayAvg: 0 } } = data ?? {};

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">사장님 대시보드</h1>
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/dashboard/${restaurantId}/menu`}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              메뉴 관리
            </Link>
            <Link
              href={`/${locale}/dashboard/${restaurantId}/tables`}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              테이블 관리
            </Link>
            <Link
              href={`/${locale}/dashboard/${restaurantId}/settings`}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              기본 정보
            </Link>
            <WeeklyReportButton restaurantId={restaurantId} />
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-600">오늘 통계</h2>
          <StatsCards stats={stats} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-600">신규 주문 (pending)</h2>
          {pendingOrders.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
              대기 중인 주문이 없습니다.
            </div>
          ) : (
            <ul className="space-y-4">
              {pendingOrders.map((order) => (
                <li key={order.id}>
                  <OrderCard order={order} onComplete={handleComplete} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
