import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: {
    locale: string;
  };
};

export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = params;

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
