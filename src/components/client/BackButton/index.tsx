'use-client';

import { useInternalHistory } from '@/lib/hooks/useInternalHistory';
import Image from 'next/image';
import styles from './BackButton.module.scss';

export default function BackButton({}) {
  const { goBack } = useInternalHistory();

  return (
    <button title="Voltar" className={styles.btn} onClick={goBack}>
      <Image src="/images/back.svg" alt="Back" width={60} height={60} />
    </button>
  );
}
