import { RefObject, useEffect, useRef } from 'react';

export function useScrollPropagate(
  preventDefault: boolean = true,
  ignoredReferences: RefObject<HTMLElement | null>[] = []
) {
  // Refs
  const parentRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    const scrollableParent = parentRef.current;
    const scrollableContent = targetRef.current;

    if (scrollableParent && scrollableContent) {
      const handleParentWheel = (event: WheelEvent) => {
        // Previne o comportamento de scroll padrão do elemento pai
        if (preventDefault) {
          event.preventDefault();
        }

        // Rola o elemento filho na mesma direção e com a mesma quantidade
        scrollableContent.scrollTop += event.deltaY;
      };

      // Adiciona o event listener ao elemento pai
      scrollableParent.addEventListener('wheel', handleParentWheel, {
        passive: false
      });

      // Exclusões
      const textAreas = scrollableParent.querySelectorAll('textarea');

      const ignoredElements: HTMLElement[] = [];

      ignoredReferences.forEach(ref => {
        if (ref.current != null) {
          ignoredElements.push(ref.current);
        }
      });

      ignoredElements.push(...textAreas);

      const handleScrollPropagation = (event: WheelEvent) => {
        // Para a propagação do evento para que o listener do pai não seja ativado
        event.stopPropagation();
      };

      // Adiciona o event listener de stopPropagation a cada item na lista de exclusão
      ignoredElements.forEach(element => {
        element.addEventListener('wheel', handleScrollPropagation, {
          passive: false
        });
      });

      // Função de limpeza
      return () => {
        scrollableParent.removeEventListener('wheel', handleParentWheel);
        // Remove o event listener de cada item na lista de exclusão
        ignoredElements.forEach(element => {
          element.removeEventListener('wheel', handleScrollPropagation);
        });
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { parentRef, targetRef };
}
