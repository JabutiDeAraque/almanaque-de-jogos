import { useState, useEffect } from 'react';
import Home from './pages/Home';
import JogoPage from './pages/JogoPage';
import { Analytics } from '@vercel/analytics/react';

function lerRota() {
  const hash = window.location.hash.slice(1) || '/';       // remove "#"
  const [caminho, query] = hash.split('?');
  const params = new URLSearchParams(query || '');
  return { caminho, params };
}

export default function App() {
  const [rota, setRota] = useState(lerRota);

  useEffect(() => {
    const aoMudar = () => setRota(lerRota());
    window.addEventListener('hashchange', aoMudar);
    return () => window.removeEventListener('hashchange', aoMudar);
  }, []);

  // Sincroniza com a API de tela cheia
  useEffect(() => {
    const eventos = ['pointerdown', 'pointerup', 'keydown'];
    const tentar = () => {
      try {
        if (localStorage.getItem('flis:telaCheia') !== '1') return;
        if (document.fullscreenElement || document.webkitFullscreenElement) return;
        const d = document.documentElement;
        const pedir = d.requestFullscreen || d.webkitRequestFullscreen;
        if (pedir) Promise.resolve(pedir.call(d)).catch(() => {});
      } catch (e) {}
    };
    eventos.forEach(e => document.addEventListener(e, tentar, true));
    return () => eventos.forEach(e => document.removeEventListener(e, tentar, true));
  }, []);

  // Função que renderiza o conteúdo baseado na rota
  function renderizarConteudo() {
    if (rota.caminho === '/' || rota.caminho === '') {
      return <Home />;
    }

    const match = rota.caminho.match(/^\/jogo\/([a-z]+)$/);
    if (match) {
      return <JogoPage id={match[1]} params={rota.params} />;
    }

    return (
      <main style={{ padding: 40, textAlign: 'center', color: '#fff' }}>
        <h1 className="titulo-comic ciano">Ops! Página não encontrada.</h1>
        <p><a href="#/" style={{ color: 'var(--comic-cyan)' }}>Voltar ao início</a></p>
      </main>
    );
  }

  return (
    <>
      {renderizarConteudo()}
      <Analytics />
    </>
  );
}