import { useState, useEffect, useRef } from 'react';

export function useCronometro() {
  const [segundos, setSegundos] = useState(0);
  const idRef = useRef(null);
  const baseRef = useRef(0);
  const inicioRef = useRef(0);

  function iniciar() {
    inicioRef.current = Date.now();
    idRef.current = setInterval(() => {
      setSegundos(baseRef.current + Math.floor((Date.now() - inicioRef.current) / 1000));
    }, 250);
  }

  function parar() {
    clearInterval(idRef.current);
    baseRef.current = segundos;
  }

  function zerar() {
    clearInterval(idRef.current);
    baseRef.current = 0;
    setSegundos(0);
  }

  useEffect(() => () => clearInterval(idRef.current), []);

  const formatado =
    String(Math.floor(segundos / 60)).padStart(2, '0') + ':' +
    String(segundos % 60).padStart(2, '0');

  return { segundos, formatado, iniciar, parar, zerar };
}