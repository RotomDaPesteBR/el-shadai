import '@/styles/globals.scss';
import { Geist, Geist_Mono, Inter } from 'next/font/google';

import { redirect, routing } from '@/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  getTranslations,
  setRequestLocale
} from 'next-intl/server';

import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import { getTheme } from '@/lib/getTheme';

import NavigationBar from '@/components/Navigation/NavigationBar/NavigationBar';
import NavigationItem from '@/components/Navigation/NavigationItem/NavigationItem';
import ToggleTheme from '@/components/ToggleTheme/ToggleThemeWrapper';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './layout.module.scss';

const inter = Inter({
  subsets: ['latin']
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Promise<any>;
}) {
  const { locale }: { locale: string } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    redirect({ href: `/${locale}`, locale: routing.defaultLocale });
  }

  const messages = await getMessages();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Components.Layout' });

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head>
        <title>{t('Title')}</title>
        <script dangerouslySetInnerHTML={{ __html: getTheme }} />
      </head>
      <body
        className={`${inter.className} ${geistSans.variable} ${geistMono.variable} ${styles.container} antialiased`}
      >
        <NextIntlClientProvider
          timeZone="America/Sao_Paulo"
          messages={messages}
        >
		  {/*<Header />*/}
          <NavigationBar>
            <NavigationItem href="/">{t('Navigation.Home')}</NavigationItem>
          </NavigationBar>
          <main className={styles.content}>{children}</main>
          <Footer>
            <ToggleTheme />
          </Footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
