'use client';

import Textbox from '@/components/Textbox/Textbox';
import { ProviderId } from 'next-auth/providers';
import { SignInAuthorizationParams, SignInOptions } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './page.module.scss';

export default function Login({
  signIn
}: {
  signIn: (
    provider?: ProviderId,
    options?: SignInOptions<true>,
    authorizationParams?: SignInAuthorizationParams
  ) => Promise<void>;
}) {
  //const t = useTranslations('Pages.Index');

  const [email, setEmail] = useState<string | null>('');
  const [password, setPassword] = useState<string | null>('');

  const [processing, setProcessing] = useState<boolean>(false);

  const [authenticated, setAuthenticated] = useState<boolean>(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!processing && !authenticated) {
      const data = { email, password };

      setProcessing(true);

      try {
        await signIn('credentials', data);

        //if ((res.status = 200)) {
        //toast.success('Login realizado com sucesso');
        setAuthenticated(true);

        redirect('/');
        //}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (ex: any) {
        const { response } = ex;

        if (response.status === 401) {
          toast.error('Email e/ou senha inválidos');
        } else if (response.status === 500) {
          toast.error('Ocorreu um erro, tente novamente mais tarde');
        }

        console.log(ex);
      }

      setProcessing(false);
    }
  }

  return (
    <>
      <div className={styles.logo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="El Shadai Logo" />
        <div>El Shadai</div>
      </div>
      <form onSubmit={e => login(e)} className={styles.credentials}>
        <div className={styles.input}>
          <label className={styles.label} htmlFor="email">
            Email:
          </label>
          <Textbox
            id="email"
            type="email"
            autoComplete="true"
            placeholder="Insira seu email"
            required
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </div>
        <div className={styles.input}>
          <label className={styles.label} htmlFor="password">
            Senha:
          </label>
          <Textbox
            id="password"
            type="password"
            placeholder="Insira sua senha"
            required
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
        </div>
        <div className={styles.actions}>
          <button name="login" className={styles.login_btn}>
            Login
          </button>
          <span className={styles.signup_text}>
            Não tem uma conta?{' '}
            <Link className={styles.signup} href="/auth/signup">
              Cadastre-se
            </Link>
          </span>
        </div>
      </form>
    </>
  );
}
