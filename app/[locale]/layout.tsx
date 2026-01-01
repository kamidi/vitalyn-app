import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css"; 

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: any; // <--- ON FORCE LE PASSAGE ICI (Hack TypeScript)
}) {
  // On garde la logique correcte pour Next.js 15 (await)
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
