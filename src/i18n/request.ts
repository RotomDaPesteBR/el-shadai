import { getRequestConfig } from 'next-intl/server';
//import { routing } from './routing';

export default getRequestConfig(async (/*{ requestLocale }*/) => {
  const locale = 'pt';
  // This typically corresponds to the `[locale]` segment
  //await requestLocale;

  // // Ensure that a valid locale is used
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // if (!locale || !routing.locales.includes(locale as any)) {
  //   locale = routing.defaultLocale;
  // }

  return {
    locale,
    messages: (await import(`../locale/${locale}.json`)).default
  };
});
