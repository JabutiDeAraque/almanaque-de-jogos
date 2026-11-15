import { useState } from 'react';

export function useVidas(total) {
  const [restantes, setRestantes] = useState(total);

  function perder() {
    if (total === Infinity) return Infinity;
    const novo = Math.max(0, restantes - 1);
    setRestantes(novo);
    return novo;
  }

  function reiniciar() {
    setRestantes(total);
  }

  const desenho = total === Infinity 
    ? '' 
    : '❤️'.repeat(restantes) + '🖤'.repeat(total - restantes);

  return { restantes, perder, reiniciar, desenho };
}