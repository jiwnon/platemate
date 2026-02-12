import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations('Home');
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-primary-600 mb-2">Kurious</h1>
      <p className="text-gray-600 text-center mb-8">{t('tagline')}</p>
      <div className="flex gap-4">
        <Link
          href="/order/demo/table-1"
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          {t('guestOrder')}
        </Link>
        <Link
          href="/dashboard/demo"
          className="px-6 py-3 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition"
        >
          {t('dashboard')}
        </Link>
      </div>
    </main>
  );
}
