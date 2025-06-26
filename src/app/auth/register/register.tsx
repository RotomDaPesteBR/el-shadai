'use client';

import Dropdown from '@/components/shared/Dropdown/Dropdown';
import Textbox from '@/components/shared/Textbox/Textbox';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react'; // Importe useEffect
import toast from 'react-hot-toast';
import styles from './page.module.scss';

interface Neighborhood {
  id: number;
  description: string;
  zone: string;
}

// Definição das props para este componente
interface RegisterProps {
  neighborhoods: Neighborhood[];
}

export default function Register({ neighborhoods }: RegisterProps) {
  const router = useRouter();

  // Estados para os campos do formulário
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  // selectedNeighId inicializa com o primeiro bairro se houver, ou vazio.
  const [selectedNeighId, setSelectedNeighId] = useState<string>(
    neighborhoods.length > 0 ? neighborhoods[0].id.toString() : ''
  );

  const [processing, setProcessing] = useState<boolean>(false);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (processing) {
      return;
    }

    // Validação básica frontend
    if (!username || !email || !password || !selectedNeighId) {
      toast.error(
        'Por favor, preencha todos os campos obrigatórios (incluindo o bairro).'
      );
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setProcessing(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/signup`,
        {
          name: name || null,
          username,
          email,
          password,
          address: address || null,
          neighId: parseInt(selectedNeighId, 10) // Envia o ID do bairro selecionado
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        toast.success(
          'Cadastro realizado com sucesso! Faça login para continuar.'
        );
        setTimeout(() => {
          router.push('/auth/login');
        }, 500);
      } else {
        toast.error('Ocorreu um erro inesperado no cadastro.');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (ex: any) {
      console.error('Registration error:', ex.response?.data || ex.message);
      if (axios.isAxiosError(ex) && ex.response) {
        if (ex.response.status === 409) {
          toast.error(
            ex.response.data.message ||
              'Nome de usuário ou email já cadastrado.'
          );
        } else if (ex.response.status === 400) {
          toast.error(
            ex.response.data.message || 'Dados inválidos para cadastro.'
          );
        } else if (ex.response.status === 500) {
          toast.error(
            'Ocorreu um erro interno no servidor, tente novamente mais tarde.'
          );
        } else {
          toast.error(
            ex.response.data.message || 'Ocorreu um erro durante o cadastro.'
          );
        }
      } else {
        toast.error(
          'Erro de conexão, verifique sua internet e tente novamente.'
        );
      }
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
      <form onSubmit={e => register(e)} className={styles.credentials}>
        <div className={styles.input}>
          <label className={styles.label} htmlFor="name">
            Nome completo:
          </label>
          <Textbox
            id="name"
            type="text"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
          />
        </div>
        <div className={styles.input}>
          <label className={styles.label} htmlFor="username">
            Nome de usuário:
          </label>
          <Textbox
            id="username"
            type="text"
            placeholder="Escolha um nome de usuário"
            required
            value={username}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
          />
        </div>
        <div className={styles.input}>
          <label className={styles.label} htmlFor="email">
            Email:
          </label>
          <Textbox
            id="email"
            type="email"
            placeholder="Seu email"
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
            placeholder="Escolha uma senha (min. 6 caracteres)"
            required
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
        </div>
        <div className={styles.input}>
          <label className={styles.label} htmlFor="address">
            Endereço:
          </label>
          <Textbox
            id="address"
            type="text"
            placeholder="Seu endereço"
            value={address}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAddress(e.target.value)
            }
          />
        </div>

        <div className={styles.input}>
          <label className={styles.label} htmlFor="neighId">
            Bairro:
          </label>
          {neighborhoods.length === 0 ? (
            <p className={styles.error_message}>Nenhum bairro disponível.</p>
          ) : (
            <Dropdown
              id="neighId"
              value={selectedNeighId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setSelectedNeighId(e.target.value)
              }
              required
            >
              <option value="" hidden={true}>
                Selecione seu bairro
              </option>
              {neighborhoods.map(neigh => (
                <option key={neigh.id} value={neigh.id}>
                  {neigh.description} ({neigh.zone})
                </option>
              ))}
            </Dropdown>
          )}
        </div>

        <div className={styles.actions}>
          <button
            name="signup"
            className={styles.login_btn}
            disabled={processing}
            type="submit"
          >
            {processing ? 'Cadastrando...' : 'Cadastrar'}
          </button>
          <span className={styles.signup_text}>
            Já tem uma conta?{' '}
            <Link className={styles.signup} href="/auth/login">
              Faça login
            </Link>
          </span>
        </div>
      </form>
    </>
  );
}
