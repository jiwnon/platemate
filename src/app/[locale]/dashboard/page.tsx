import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser, getOwnedRestaurantIds } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardListPage({ params }: Props) {
  const { locale } = await params;
  await requireUser(locale);

  const ids = await getOwnedRestaurantIds();
  if (ids.length === 0) {
    redirect(`/${locale}/dashboard/new`);
  }

  const supabase = await createClient();
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name, slug')
    .in('id', ids);

  if (!restaurants || restaurants.length === 1) {
    const single = restaurants?.[0];
    if (single) redirect(`/${locale}/dashboard/${single.id}`);
  }

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">내 레스토랑</h1>
        <ul className="space-y-3">
          {(restaurants ?? []).map((r) => (
            <li key={r.id}>
              <Link
                href={`/${locale}/dashboard/${r.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-primary-300 hover:shadow transition"
              >
                <span className="font-medium text-gray-900">{r.name}</span>
                <span className="ml-2 text-sm text-gray-500">({r.slug})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
