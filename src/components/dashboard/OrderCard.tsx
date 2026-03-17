'use client';

import { useState } from 'react';

export type OrderItemLine = {
  menu_name: string;
  quantity: number;
  unit_price: number;
};

export type DashboardOrder = {
  id: string;
  table_id: string;
  table_number: number | null;
  table_name: string;
  status: string;
  total_amount: number;
  created_at: string;
  locale: string | null;
  items: OrderItemLine[];
};

const LOCALE_BADGE: Record<string, { flag: string; label: string }> = {
  ko: { flag: '🇰🇷', label: '한국어' },
  en: { flag: '🇺🇸', label: 'English' },
  zh: { flag: '🇨🇳', label: '中文' },
  ja: { flag: '🇯🇵', label: '日本語' },
  ru: { flag: '🇷🇺', label: 'Русский' },
};

type Props = {
  order: DashboardOrder;
  onComplete: (orderId: string) => Promise<void>;
};

function formatOrderTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function OrderCard({ order, onComplete }: Props) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await onComplete(order.id);
    } finally {
      setLoading(false);
    }
  };

  const tableLabel = order.table_number != null ? `테이블 ${order.table_number}` : order.table_name;
  const localeBadge = order.locale ? LOCALE_BADGE[order.locale] : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">{tableLabel}</p>
            {localeBadge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {localeBadge.flag} {localeBadge.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{formatOrderTime(order.created_at)}</p>
        </div>
        <button
          type="button"
          onClick={handleComplete}
          disabled={loading}
          className="shrink-0 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? '처리 중…' : '완료'}
        </button>
      </div>
      <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between text-sm text-gray-700">
            <span>
              {item.menu_name} × {item.quantity}
            </span>
            <span>₩{(item.unit_price * item.quantity).toLocaleString()}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-right font-semibold text-gray-900">
        합계 ₩{order.total_amount.toLocaleString()}
      </p>
    </div>
  );
}
