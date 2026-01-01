import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  // 1. Sécurité : Redirection si déjà connecté
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  // 2. Chargement des traductions
  const t = await getTranslations('HomePage');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-black text-indigo-600 tracking-tighter">VITALYN</div>
        <div className="space-x-4">
          <Link 
            href="/login" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t('ctaLogin')}
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
          >
            {t('ctaStart')}
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 mt-10 sm:mt-0">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {t('heroTitle')}
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              {t('ctaStart')}
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 text-lg font-bold rounded-xl hover:bg-gray-50 transition"
            >
              {t('ctaLogin')}
            </Link>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-24 mb-24 px-4 text-left">
          
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🧬
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{t('feature1Title')}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t('feature1Desc')}</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🛡️
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{t('feature2Title')}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t('feature2Desc')}</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              📱
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{t('feature3Title')}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t('feature3Desc')}</p>
          </div>

        </div>
      </main>

      {/* FOOTER SIMPLE */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t">
        &copy; {new Date().getFullYear()} Vitalyn V1. Built for performance.
      </footer>
    </div>
  );
}