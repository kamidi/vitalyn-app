import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css"; // Vérifie que ce chemin est bon pour toi

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // <--- CHANGEMENT 1 : C'est une Promise maintenant
}) {
  // CHANGEMENT 2 : On doit "attendre" les paramètres
  const { locale } = await params;

  // Récupérer les messages côté serveur
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}