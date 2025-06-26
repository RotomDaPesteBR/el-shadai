'use client';

import Textbox from '@/components/shared/Textbox/Textbox';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './page.module.scss';

export default function Login() {
  //const t = useTranslations('Pages.Index');

  const [email, setEmail] = useState<string | null>('');
  const [password, setPassword] = useState<string | null>('');

  const [processing, setProcessing] = useState<boolean>(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (processing) {
      return;
    }

    setProcessing(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          toast.error(
            'Email e/ou senha inválidos. Por favor, tente novamente.'
          );
        } else if (result.error.includes('MissingFields')) {
          toast.error('Por favor, preencha todos os campos.');
        } else if (result.error.includes('An unexpected error occurred')) {
          toast.error(
            'Ocorreu um erro inesperado, tente novamente mais tarde.'
          );
        } else {
          toast.error(result.error);
        }
      } else if (result?.url) {
        toast.success('Login realizado com sucesso!');
        setTimeout(() => {
          redirect('/');
        }, 500);
      } else {
        toast.error('Ocorreu um erro desconhecido.');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (ex: any) {
      console.error('Unhandled login exception:', ex);
      toast.error('Erro de conexão, tente novamente.');
    } finally {
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
            {!processing ? (
              'Entrar'
            ) : (
              <div className={styles.login_btn_content}>
                <div className={styles.login_btn_text}>Entrando...</div>
                <div className={styles.spinner} />
              </div>
            )}
          </button>
          <span className={styles.signup_text}>
            Não tem uma conta?{' '}
            <Link className={styles.signup} href="/auth/register">
              Cadastre-se
            </Link>
          </span>
        </div>
      </form>
    </>
  );
}
