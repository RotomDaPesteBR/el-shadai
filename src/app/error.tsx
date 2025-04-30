'use client';

import ErrorWarning from '@/components/Error/Error';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function Error({
  error
}: {
  error: Error & { digest?: string };
  locale: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = useTranslations('Pages.Error');

  return (
    <>
      <title>{t('Title')}</title>
      <ErrorWarning>{t('Message')}</ErrorWarning>
    </>
  );
}
