'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  locale: string;
};

export function NewRestaurantForm({ locale }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSlugFromName = () => {
    const s = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (s) setSlug(s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!trimmedName || !trimmedSlug) {
      setError('이름과 슬러그를 입력하세요.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, slug: trimmedSlug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? '등록에 실패했습니다.');
      }
      const restaurant = data as { id: string };
      router.push(`/${locale}/dashboard/${restaurant.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">레스토랑 이름 *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSlugFromName}
          required
          placeholder="예: 강남 맛집"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          슬러그 (URL용, 영소문자·숫자·하이픈) *
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          placeholder="예: my-restaurant"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          주문 링크에 사용됩니다. 등록 후 변경할 수 없습니다.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-primary-500 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {saving ? '등록 중…' : '레스토랑 등록'}
      </button>
    </form>
  );
}
