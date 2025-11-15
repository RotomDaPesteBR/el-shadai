'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Define a chave para o sessionStorage
const HISTORY_KEY = 'app_history';

/**
 * Hook para gerenciar o histórico de navegação interno da sua aplicação Next.js.
 * Ele armazena as URLs visitadas no sessionStorage para controlar o botão "Voltar".
 */

export function useInternalHistory() {
  const router = useRouter();
  const pathname = usePathname();
  const historyRef = useRef<string[]>([]); // Tipado como array de strings, nunca undefined

  useEffect(() => {
    // Carrega o histórico do sessionStorage na montagem inicial
    try {
      const storedHistory = JSON.parse(
        sessionStorage.getItem(HISTORY_KEY) || '[]'
      );

      // Garante que o histórico carregado é um array de strings válido
      if (
        Array.isArray(storedHistory) &&
        storedHistory.every(item => typeof item === 'string')
      ) {
        historyRef.current = storedHistory;
      } else {
        // Se o formato estiver incorreto, inicializa com array vazio e limpa sessionStorage
        console.warn(
          'Histórico do sessionStorage em formato inválido. Reinicializando.'
        );
        historyRef.current = [];
        sessionStorage.setItem(HISTORY_KEY, '[]');
      }
    } catch (error) {
      // Em caso de erro de parsing JSON ou outro erro, reinicializa o histórico
      console.error('Erro ao carregar histórico do sessionStorage:', error);
      historyRef.current = [];
      sessionStorage.setItem(HISTORY_KEY, '[]');
    }
  }, []); // Executa apenas na montagem inicial

  useEffect(() => {
    // pathname pode ser null/undefined brevemente em algumas transições. Validar.
    if (!pathname) {
      // console.warn("Pathname é undefined, ignorando adição ao histórico.");
      return; // Não adicione ao histórico se o pathname não for válido
    }

    const currentHistory = historyRef.current; // Já é string[], nunca undefined

    // Remove todas as ocorrências anteriores do pathname antes de adicioná-lo ao final.
    // Isso garante que uma rota só apareça uma vez no histórico e sempre na sua posição mais recente.
    const filteredHistory = currentHistory.filter(item => item !== pathname);

    // Adiciona o pathname atual ao final do histórico filtrado.
    const newHistory = [...filteredHistory, pathname];

    // Atualiza o sessionStorage e a ref, mas apenas se houve uma mudança real para salvar
    // ou se o histórico estava vazio e o pathname é o primeiro item.
    if (JSON.stringify(newHistory) !== JSON.stringify(currentHistory)) {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      historyRef.current = newHistory;
      // console.log("Histórico atualizado:", historyRef.current);
    }
  }, [pathname]); // Depende do pathname para detectar mudanças de rota

  const goBack = () => {
    let currentHistory = historyRef.current; // Já é string[], nunca undefined

    // Salvaguarda: Tenta recarregar do sessionStorage para ter o estado mais atualizado.
    try {
      const storedHistory = JSON.parse(
        sessionStorage.getItem(HISTORY_KEY) || '[]'
      );
      // Valida o conteúdo do sessionStorage novamente ao recarregar
      if (
        Array.isArray(storedHistory) &&
        storedHistory.every(item => typeof item === 'string')
      ) {
        currentHistory = storedHistory;
      } else {
        console.warn(
          'Histórico do sessionStorage em formato inválido ao recarregar para goBack. Usando o histórico atual da ref.'
        );
        // Se inválido, mantém o currentHistory que já veio da ref
      }
    } catch (error) {
      console.error('Erro ao recarregar histórico para goBack:', error);
      // Em caso de erro, o currentHistory da ref será usado
    }

    // A condição 'currentHistory != undefined' que você adicionou é redundante aqui
    // porque 'historyRef.current' (e, por extensão, 'currentHistory') já é tipado como string[]
    // e inicializado como [], então nunca será undefined.
    // O foco agora é garantir que 'previousRoute' não seja undefined e que a array tenha itens suficientes.

    // Se houver mais de uma entrada no histórico, significa que há pelo menos
    // a página atual e uma página anterior para voltar.
    if (currentHistory.length > 1) {
      // Remove a última entrada (a página atual) para obter o histórico anterior
      const historyWithoutCurrent = currentHistory.slice(
        0,
        currentHistory.length - 1
      );

      // A rota anterior é a última entrada no histórico "encolhido"
      const previousRoute =
        historyWithoutCurrent.length > 0 // Validação: Garante que há algo no array
          ? historyWithoutCurrent[historyWithoutCurrent.length - 1]
          : '/'; // Fallback para home se por algum motivo o array estiver vazio após slice

      // Validação extra: Garante que previousRoute é uma string válida antes de usar router.push
      if (typeof previousRoute === 'string' && previousRoute.trim() !== '') {
        // Atualiza o sessionStorage e a ref com o histórico "encolhido"
        sessionStorage.setItem(
          HISTORY_KEY,
          JSON.stringify(historyWithoutCurrent)
        );
        historyRef.current = historyWithoutCurrent;

        router.push(previousRoute);
        // console.log("Voltando para:", previousRoute, "Novo histórico:", historyRef.current);
      } else {
        console.warn('Rota anterior inválida, redirecionando para a home.');
        sessionStorage.removeItem(HISTORY_KEY);
        historyRef.current = [];
        router.push('/');
      }
    } else {
      // Se não há histórico suficiente (0 ou 1 entrada), vai para a página inicial
      sessionStorage.removeItem(HISTORY_KEY); // Limpa o histórico
      historyRef.current = [];
      router.push('/');
      // console.log("Sem histórico suficiente, indo para a home.");
    }
  };

  return { goBack };
}
