'use client';

import { useState } from 'react';
import type { Locale } from '@/types';
import { CouponModal } from './CouponModal';

export type OrderItemForReview = {
  id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  menu_name: string | null;
  menu_name_i18n: Record<string, string> | null;
};

function getItemName(item: OrderItemForReview, locale: Locale): string {
  const i18n = item.menu_name_i18n;
  if (i18n && typeof i18n === 'object') {
    const name = (i18n as Record<Locale, string>)[locale];
    if (name) return name;
  }
  return item.menu_name ?? `Menu ${item.menu_item_id.slice(0, 8)}`;
}

type Props = {
  orderId: string;
  locale: Locale;
  items: OrderItemForReview[];
  onClose: () => void;
};

export function ReviewModal({ orderId, locale, items, onClose }: Props) {
  const [foodRating, setFoodRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [comment, setComment] = useState('');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleLiked = (menuItemId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuItemId)) next.delete(menuItemId);
      else next.add(menuItemId);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (foodRating < 1 || serviceRating < 1) {
      setError('음식·서비스 만족도에 별점을 선택해 주세요.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          foodRating,
          serviceRating,
          comment: comment.trim() || undefined,
          likedItems: Array.from(likedIds),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data as { ok?: boolean }).ok) {
        const code = (data as { couponCode?: string }).couponCode;
        if (code) setCouponCode(code);
        else setSubmitted(true);
      } else {
        setError((data as { error?: string }).error ?? '제출에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (couponCode) {
    return <CouponModal couponCode={couponCode} onClose={onClose} />;
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <p className="text-2xl font-bold text-primary-600">감사합니다!</p>
          <p className="mt-2 text-gray-600">소중한 평가 감사드립니다.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-xl bg-primary-500 px-6 py-3 font-medium text-white transition hover:bg-primary-600"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 border-b border-gray-200 bg-white px-4 py-3">
          <h2 className="text-lg font-bold text-gray-900">비공개 평가</h2>
          <p className="text-sm text-gray-500">식사는 어떠셨나요? (사장님만 확인합니다)</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-700">음식 만족도</p>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFoodRating(n)}
                  className="text-2xl focus:outline-none"
                  aria-label={`${n}점`}
                >
                  {n <= foodRating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">서비스 만족도</p>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setServiceRating(n)}
                  className="text-2xl focus:outline-none"
                  aria-label={`${n}점`}
                >
                  {n <= serviceRating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">개선 의견 (선택)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="더 좋아지면 좋겠다 싶은 점이 있으면 적어 주세요."
              rows={3}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          {items.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700">좋았던 메뉴 (선택)</p>
              <ul className="mt-2 space-y-2">
                {Array.from(
                  new Map(items.map((item) => [item.menu_item_id, item])).values()
                ).map((item) => (
                  <li key={item.menu_item_id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`liked-${item.menu_item_id}`}
                      checked={likedIds.has(item.menu_item_id)}
                      onChange={() => toggleLiked(item.menu_item_id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor={`liked-${item.menu_item_id}`}
                      className="cursor-pointer text-sm text-gray-700"
                    >
                      {getItemName(item, locale)}
                      {item.quantity > 1 ? ` × ${item.quantity}` : ''}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              나중에
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-primary-500 py-3 font-medium text-white transition hover:bg-primary-600 disabled:opacity-50"
            >
              {submitting ? '제출 중…' : '제출'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
