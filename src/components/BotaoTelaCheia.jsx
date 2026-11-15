import { useState, useEffect } from 'react';
import BotaoComic from './BotaoComic';
import { telaCheiaAtiva, alternarTelaCheia } from '../lib/jogo';
import { quererTelaCheia } from '../lib/storage';

export default function BotaoTelaCheia() {
  const [ativa, setAtiva] = useState(false);

  useEffect(() => {
    const atualizar = () => setAtiva(telaCheiaAtiva());
    atualizar();
    document.addEventListener('fullscreenchange', atualizar);
    document.addEventListener('webkitfullscreenchange', atualizar);
    return () => {
      document.removeEventListener('fullscreenchange', atualizar);
      document.removeEventListener('webkitfullscreenchange', atualizar);
    };
  }, []);

  return (
    <BotaoComic cor="branco" pequeno onClick={() => alternarTelaCheia(quererTelaCheia)}>
      {ativa ? 'Tela normal' : 'Tela cheia'}
    </BotaoComic>
  );
}