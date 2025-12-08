import { signOut } from '@/app/auth';
import Image from 'next/image';
import styles from './LogoutButton.module.scss';

export default function LogoutButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut();
        return;
      }}
    >
      <button className={styles.btn} title="Sair da conta">
        <Image src="/images/exit.svg" alt="Logout" height={50} width={50} />
      </button>
    </form>
  );
}
