'use client';

import { useEffect, useState, useCallback } from 'react';

export type TableRow = {
  id: string;
  restaurant_id: string;
  name: string;
  table_number: number | null;
  qr_code: string | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  restaurantId: string;
  locale: string;
};

async function fetchTables(restaurantId: string): Promise<TableRow[]> {
  const res = await fetch(`/api/dashboard/${restaurantId}/tables`);
  if (!res.ok) throw new Error('Failed to fetch tables');
  const { items } = await res.json();
  return items ?? [];
}

function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') return window.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? '';
}

export function TableManageContent({ restaurantId, locale }: Props) {
  const [items, setItems] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<'add' | { edit: TableRow } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchTables(restaurantId)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = useCallback(
    async (item: TableRow) => {
      if (!confirm(`"${item.name}" 테이블을 삭제할까요?`)) return;
      const res = await fetch(`/api/dashboard/${restaurantId}/tables/${item.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert((data as { error?: string }).error ?? '삭제에 실패했습니다.');
        return;
      }
      setModal(null);
      load();
    },
    [restaurantId, load]
  );

  const handleDownloadQr = useCallback(
    async (tableId: string, tableName: string) => {
      const baseUrl = getAppBaseUrl();
      const url = `/api/dashboard/${restaurantId}/tables/${tableId}/qr?baseUrl=${encodeURIComponent(baseUrl)}&locale=${encodeURIComponent(locale)}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('QR 생성 실패');
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `qr-${tableName.replace(/\s+/g, '-')}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      } catch {
        alert('QR 코드 다운로드에 실패했습니다.');
      }
    },
    [restaurantId, locale]
  );

  if (loading && items.length === 0) {
    return <p className="text-gray-500">테이블을 불러오는 중…</p>;
  }
  if (error && items.length === 0) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setModal('add')}
          className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
        >
          테이블 추가
        </button>
      </div>

      <ul className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500">
                테이블 번호: {item.table_number ?? '-'}
              </p>
            </div>
            <a
              href={`/${locale}/order/${restaurantId}/${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:underline"
            >
              주문 URL
            </a>
            <button
              type="button"
              onClick={() => handleDownloadQr(item.id, item.name)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              QR 다운로드
            </button>
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

      {items.length === 0 && !loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          등록된 테이블이 없습니다. 테이블을 추가한 뒤 QR 코드를 다운로드해 사용하세요.
        </div>
      )}

      {modal && (
        <TableFormModal
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

type FormModalProps = {
  restaurantId: string;
  initial: TableRow | null;
  onClose: () => void;
  onSaved: () => void;
};

function TableFormModal({ restaurantId, initial, onClose, onSaved }: FormModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [tableNumber, setTableNumber] = useState<number | ''>(initial?.table_number ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      setSaving(true);
      setError(null);
      try {
        if (initial) {
          const res = await fetch(`/api/dashboard/${restaurantId}/tables/${initial.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              table_number: tableNumber === '' ? null : Number(tableNumber),
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error((data as { error?: string }).error ?? '수정 실패');
          }
        } else {
          const res = await fetch(`/api/dashboard/${restaurantId}/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              table_number: tableNumber === '' ? null : Number(tableNumber),
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error((data as { error?: string }).error ?? '추가 실패');
          }
        }
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed');
      } finally {
        setSaving(false);
      }
    },
    [restaurantId, initial, name, tableNumber, onSaved]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {initial ? '테이블 수정' : '테이블 추가'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">테이블 번호</label>
            <input
              type="number"
              min={1}
              value={tableNumber}
              onChange={(e) =>
                setTableNumber(e.target.value === '' ? '' : Number(e.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
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
              {saving ? '저장 중…' : initial ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
