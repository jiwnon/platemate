'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

type RestaurantData = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  name_i18n: Record<string, string> | null;
};

const LOCALES = ['ko', 'en', 'zh', 'ja'] as const;
const LOCALE_LABELS: Record<string, string> = { ko: '한국어', en: 'English', zh: '中文', ja: '日本語' };

type Props = {
  restaurantId: string;
};

export function RestaurantSettingsContent({ restaurantId }: Props) {
  const [data, setData] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nameI18n, setNameI18n] = useState<Record<string, string>>({});
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/dashboard/${restaurantId}/restaurant`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((d: RestaurantData) => {
        setData(d);
        setName(d.name);
        setNameI18n((d.name_i18n as Record<string, string>) ?? {});
        setLogoUrl(d.logo_url ?? '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      setSaveError(null);
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`/api/dashboard/${restaurantId}/restaurant/upload`, {
          method: 'POST',
          body: form,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? 'Upload failed');
        }
        const { url } = await res.json();
        setLogoUrl(url);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [restaurantId]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setSaveError(null);
      try {
        const res = await fetch(`/api/dashboard/${restaurantId}/restaurant`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            logo_url: logoUrl || null,
            name_i18n: nameI18n,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? 'Save failed');
        }
        load();
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Save failed');
      } finally {
        setSaving(false);
      }
    },
    [restaurantId, name, logoUrl, nameI18n, load]
  );

  if (loading && !data) {
    return <p className="text-gray-500">불러오는 중…</p>;
  }
  if (error && !data) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">레스토랑 이름 (기본) *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">다국어 이름</label>
          <div className="space-y-2">
            {LOCALES.map((loc) => (
              <div key={loc} className="flex items-center gap-2">
                <span className="w-16 text-sm text-gray-500">{LOCALE_LABELS[loc]}</span>
                <input
                  type="text"
                  value={nameI18n[loc] ?? ''}
                  onChange={(e) =>
                    setNameI18n((prev) => ({ ...prev, [loc]: e.target.value }))
                  }
                  placeholder={loc === 'ko' ? name : ''}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">로고 이미지</label>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                  없음
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="text-sm text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-primary-700"
              />
              {uploading && <p className="mt-1 text-sm text-gray-500">업로드 중…</p>}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">슬러그: {data?.slug} (URL에 사용, 변경 불가)</p>
        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
        >
          {saving ? '저장 중…' : '저장'}
        </button>
      </form>
    </div>
  );
}
