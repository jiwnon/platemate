'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

export type MenuItemRow = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  name_i18n: Record<string, string> | null;
  description_i18n: Record<string, string> | null;
  price: number;
  image_url: string | null;
  category: string | null;
  sort_order: number;
  is_available: boolean;
  spicy_level: number;
  created_at: string;
  updated_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  main: '메인',
  side: '사이드',
  drink: '음료',
};

type Props = {
  restaurantId: string;
};

async function fetchMenu(restaurantId: string): Promise<MenuItemRow[]> {
  const res = await fetch(`/api/dashboard/${restaurantId}/menu`);
  if (!res.ok) throw new Error('Failed to fetch menu');
  const { items } = await res.json();
  return items ?? [];
}

export function MenuManageContent({ restaurantId }: Props) {
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<'add' | 'scan' | { edit: MenuItemRow } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchMenu(restaurantId)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleAvailable = useCallback(
    async (item: MenuItemRow) => {
      const res = await fetch(`/api/dashboard/${restaurantId}/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !item.is_available }),
      });
      if (!res.ok) return;
      load();
    },
    [restaurantId, load]
  );

  const handleDelete = useCallback(
    async (item: MenuItemRow) => {
      if (!confirm(`"${item.name}" 메뉴를 삭제할까요?`)) return;
      const res = await fetch(`/api/dashboard/${restaurantId}/menu/${item.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as { error?: string }).error ?? '삭제에 실패했습니다.';
        alert(msg);
        return;
      }
      setModal(null);
      load();
    },
    [restaurantId, load]
  );

  if (loading && items.length === 0) {
    return <p className="text-gray-500">메뉴를 불러오는 중…</p>;
  }

  if (error && items.length === 0) {
    return <p className="text-red-600">{error}</p>;
  }

  const byCategory = (category: string) =>
    items.filter((i) => (i.category ?? 'main') === category);

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        <button
          type="button"
          onClick={() => setModal('scan')}
          className="rounded-lg border border-primary-500 px-4 py-2 text-primary-600 hover:bg-primary-50"
        >
          📷 메뉴판으로 등록
        </button>
        <button
          type="button"
          onClick={() => setModal('add')}
          className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
        >
          메뉴 추가
        </button>
      </div>

      <div className="space-y-8">
        {(['main', 'side', 'drink'] as const).map((cat) => {
          const list = byCategory(cat);
          if (list.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="mb-3 text-sm font-medium text-gray-600">
                {CATEGORY_LABELS[cat] ?? cat}
              </h2>
              <ul className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
                {list.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-4 p-4 ${!item.is_available ? 'opacity-60' : ''}`}
                  >
                    <div className="h-14 w-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt=""
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                          없음
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.price.toLocaleString()}원
                        {item.category && (
                          <span className="ml-2 text-gray-400">
                            {CATEGORY_LABELS[item.category] ?? item.category}
                          </span>
                        )}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm text-gray-600">품절</span>
                      <input
                        type="checkbox"
                        checked={!item.is_available}
                        onChange={() => handleToggleAvailable(item)}
                        className="rounded border-gray-300"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setModal({ edit: item })}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {items.length === 0 && !loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          등록된 메뉴가 없습니다. 메뉴 추가 버튼으로 등록해 보세요.
        </div>
      )}

      {modal === 'scan' && (
        <MenuScanModal
          restaurantId={restaurantId}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}

      {modal && modal !== 'scan' && (
        <MenuFormModal
          restaurantId={restaurantId}
          initial={modal === 'add' ? null : modal.edit}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </>
  );
}

type ScanModalProps = {
  restaurantId: string;
  onClose: () => void;
  onSaved: () => void;
};

type ScannedItem = {
  name: string;
  price: number;
  description: string;
  category: string;
  selected: boolean;
};

function MenuScanModal({ restaurantId, onClose, onSaved }: ScanModalProps) {
  const [step, setStep] = useState<'select' | 'scanning' | 'preview' | 'saving'>('select');
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        setError('이미지가 5MB를 초과합니다. 더 작은 이미지를 사용해 주세요.');
        return;
      }

      setStep('scanning');
      setError(null);

      try {
        const form = new FormData();
        form.append('image', file);
        const res = await fetch(`/api/dashboard/${restaurantId}/menu/scan`, {
          method: 'POST',
          body: form,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? 'Scan failed');
        }
        const { items: raw } = (await res.json()) as {
          items: Array<{ name: string; price: number; description: string; category: string }>;
        };
        setItems(raw.map((item) => ({ ...item, selected: true })));
        setStep('preview');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Scan failed');
        setStep('select');
      }
    },
    [restaurantId]
  );

  const handleSave = useCallback(async () => {
    const toSave = items.filter((i) => i.selected);
    if (toSave.length === 0) return;

    setStep('saving');
    setProgress({ done: 0, total: toSave.length });
    setError(null);

    for (let i = 0; i < toSave.length; i++) {
      const item = toSave[i];
      try {
        const res = await fetch(`/api/dashboard/${restaurantId}/menu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.name,
            description: item.description || null,
            price: item.price,
            category: item.category || null,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? 'Create failed');
        }
      } catch (err) {
        setError(`"${item.name}" 등록 실패: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setStep('preview');
        return;
      }
      setProgress({ done: i + 1, total: toSave.length });
    }

    onSaved();
  }, [items, restaurantId, onSaved]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📷 메뉴판으로 등록</h2>

          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                종이 메뉴판 사진을 찍으면 AI가 메뉴를 자동으로 인식합니다.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <label className="block">
                <span className="sr-only">메뉴판 이미지 선택</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-primary-700"
                />
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {step === 'scanning' && (
            <div className="py-8 text-center text-gray-500">
              <p className="text-base">메뉴판을 분석하고 있어요…</p>
              <p className="text-sm mt-1 text-gray-400">잠시만 기다려 주세요.</p>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="py-6 text-center space-y-3">
                  <p className="text-gray-600">메뉴를 인식하지 못했어요.</p>
                  <p className="text-sm text-gray-400">더 밝고 선명한 사진으로 다시 시도해 주세요.</p>
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
                  >
                    다시 촬영
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    {items.length}개 메뉴가 인식되었습니다. 수정 후 등록하세요.
                  </p>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-8 px-2 py-2">
                            <input
                              type="checkbox"
                              checked={items.every((i) => i.selected)}
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((i) => ({ ...i, selected: e.target.checked }))
                                )
                              }
                              className="rounded border-gray-300"
                            />
                          </th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">이름</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 w-24">가격</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 w-24">카테고리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item, idx) => (
                          <tr key={idx} className={!item.selected ? 'opacity-40' : ''}>
                            <td className="px-2 py-1.5 text-center">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((it, i) =>
                                      i === idx ? { ...it, selected: e.target.checked } : it
                                    )
                                  )
                                }
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((it, i) =>
                                      i === idx ? { ...it, name: e.target.value } : it
                                    )
                                  )
                                }
                                className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min={0}
                                value={item.price || ''}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((it, i) =>
                                      i === idx
                                        ? { ...it, price: Number(e.target.value) || 0 }
                                        : it
                                    )
                                  )
                                }
                                className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <select
                                value={item.category}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((it, i) =>
                                      i === idx ? { ...it, category: e.target.value } : it
                                    )
                                  )
                                }
                                className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                              >
                                <option value="main">메인</option>
                                <option value="side">사이드</option>
                                <option value="drink">음료</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={items.filter((i) => i.selected).length === 0}
                      className="flex-1 rounded-lg bg-primary-500 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                      선택한 메뉴 등록하기 ({items.filter((i) => i.selected).length}개)
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'saving' && progress && (
            <div className="py-8 text-center text-gray-500">
              <p className="text-base">
                {progress.done}/{progress.total} 등록 중…
              </p>
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type FormModalProps = {
  restaurantId: string;
  initial: MenuItemRow | null;
  onClose: () => void;
  onSaved: () => void;
};

function MenuFormModal({ restaurantId, initial, onClose, onSaved }: FormModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [category, setCategory] = useState(initial?.category ?? 'main');
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '');
  const [isAvailable, setIsAvailable] = useState(initial?.is_available ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      setError(null);
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`/api/dashboard/${restaurantId}/menu/upload`, {
          method: 'POST',
          body: form,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? 'Upload failed');
        }
        const { url } = await res.json();
        setImageUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [restaurantId]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      setSaving(true);
      setError(null);
      try {
        if (initial) {
          const res = await fetch(`/api/dashboard/${restaurantId}/menu/${initial.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              description: description.trim() || null,
              price: Number(price) || 0,
              category: category || null,
              image_url: imageUrl || null,
              is_available: isAvailable,
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error((data as { error?: string }).error ?? 'Update failed');
          }
        } else {
          const res = await fetch(`/api/dashboard/${restaurantId}/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              description: description.trim() || null,
              price: Number(price) || 0,
              category: category || null,
              image_url: imageUrl || null,
              is_available: isAvailable,
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error((data as { error?: string }).error ?? 'Create failed');
          }
        }
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed');
      } finally {
        setSaving(false);
      }
    },
    [restaurantId, initial, name, description, price, category, imageUrl, isAvailable, onSaved]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {initial ? '메뉴 수정' : '메뉴 추가'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원) *</label>
              <input
                type="number"
                min={0}
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="main">메인</option>
                <option value="side">사이드</option>
                <option value="drink">음료</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이미지</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full text-sm text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-primary-700"
              />
              {uploading && <p className="mt-1 text-sm text-gray-500">업로드 중…</p>}
              {imageUrl && (
                <p className="mt-1 text-sm text-green-600 truncate">등록됨</p>
              )}
            </div>
            {initial && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">판매 중 (품절 해제)</span>
              </label>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-primary-500 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
              >
                {saving ? '번역·저장 중…' : initial ? '수정' : '추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
