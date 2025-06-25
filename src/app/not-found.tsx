import ErrorWarning from '@/components/shared/Error/Error';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export default function NotFound({ locale }: { locale: string }) {
  setRequestLocale(locale);

  const t = useTranslations('Pages.404');

  return (
    <>
      <title>{t('Title')}</title>
      <ErrorWarning>{t('Message')}</ErrorWarning>
    </>
  );
}
