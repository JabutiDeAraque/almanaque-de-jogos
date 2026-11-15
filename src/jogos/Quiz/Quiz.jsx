import { useState, useEffect, useRef } from 'react';
import  TopBar  from '../../components/TopBar';
import  Modal  from '../../components/Modal';
import  SeletorNivel  from '../../components/SeletorNivel';
import BotaoComic from '../../components/BotaoComic';
import { useCronometro } from '../../hooks/useCronometro';
import { useVidas } from '../../hooks/useVidas';
import { useSom } from '../../hooks/useSom';
import { embaralhar } from '../../lib/embaralhar';
import { NIVEIS } from '../../lib/niveis';
import { DADOS } from '../../data/quiz';
import './quiz.css';

const COR_BOTOES = ['vermelho', 'azul', 'amarelo', 'verde'];
const PERGUNTAS_POR_NIVEL = { facil: 5, medio: 7, dificil: 10, desafio: 12 };
const PONTOS_ACERTO = 100;
const PAUSA_MS = 1400;

export default function Quiz({ nivelInicial, aoSair }) {
  const [nivel, setNivel] = useState(nivelInicial);
  const [mostrarSeletor, setMostrarSeletor] = useState(!nivelInicial);
  const [perguntas, setPerguntas] = useState([]);
  const [indice, setIndice] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [opcoesTravadas, setOpcoesTravadas] = useState(false);
  const [opcoesAtuais, setOpcoesAtuais] = useState([]);
  const [modal, setModal] = useState({ aberto: false, titulo: '', msg: '', placar: '' });
  
  const cronometro = useCronometro();
  const vidas = useVidas(3);
  const tocarSom = useSom();
  const timeoutRef = useRef(null);

  // Inicia o jogo quando o nível muda
  useEffect(() => {
    if (!nivel) return;
    const sorteadas = embaralhar(DADOS[nivel]).slice(0, PERGUNTAS_POR_NIVEL[nivel]);
    setPerguntas(sorteadas);
    setIndice(0);
    setPontos(0);
    vidas.reiniciar();
    setOpcoesTravadas(false);
    setModal({ aberto: false, titulo: '', msg: '', placar: '' });
    cronometro.zerar();
    cronometro.iniciar();
  }, [nivel]);

  // Atualiza opções ao mudar de pergunta
  useEffect(() => {
    if (perguntas.length === 0) return;
    const q = perguntas[indice];
    setOpcoesAtuais(embaralhar([q.certa, ...q.erradas]));
    setOpcoesTravadas(false);
  }, [indice, perguntas]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function responder(texto, indexBotao) {
    if (opcoesTravadas) return;
    setOpcoesTravadas(true);
    
    const q = perguntas[indice];
    const acertou = texto === q.certa;

    if (acertou) {
      setPontos(p => p + PONTOS_ACERTO);
      tocarSom('acerto');
    } else {
      vidas.perder();
      tocarSom('erro');
    }

    // Lógica visual de acerto/erro na array de opções
    const novasOpcoes = opcoesAtuais.map(op => {
      if (op === texto) return acertou ? '✅ ' + op : '❌ ' + op;
      if (op === q.certa) return '✅ ' + op;
      return op;
    });
    setOpcoesAtuais(novasOpcoes);

    timeoutRef.current = setTimeout(() => {
      const prox = indice + 1;
      if (vidas.restantes === 0 || prox >= perguntas.length) {
        terminar(prox);
      } else {
        setIndice(prox);
      }
    }, PAUSA_MS);
  }

  function terminar(qtdRespondidas) {
    cronometro.parar();
    const venceu = vidas.restantes > 0;
    const acertos = pontos / PONTOS_ACERTO;
    setModal({
      aberto: true,
      titulo: venceu ? (acertos === perguntas.length ? 'Perfeito! 🎉' : 'Mandou bem! 👏') : 'Acabaram as vidas! 💔',
      msg: venceu ? 'Você chegou ao fim do quiz.' : 'Mas dá pra tentar de novo!',
      placar: `${acertos} de ${perguntas.length} acertos · ${pontos} pontos · ${cronometro.formatado}`
    });
    tocarSom(venceu ? 'vitoria' : 'erro');
  }

  function trocarNivel(id) {
    setNivel(id);
    setMostrarSeletor(false);
  }

  // Define a cor do botão baseado no estado travado
  function getCorBotao(opcao, index) {
    if (!opcoesTravadas) return COR_BOTOES[index % COR_BOTOES.length];
    if (opcao.startsWith('✅')) return 'verde certa';
    if (opcao.startsWith('❌')) return 'errada';
    return COR_BOTOES[index % COR_BOTOES.length];
  }

  if (mostrarSeletor) {
    return (
      <>
        <div className="topbar"><h1 className="titulo-comic vermelho pequeno">QUIZ COMIC</h1></div>
        <SeletorNivel aberto={true} aoEscolher={trocarNivel} aoVoltar={aoSair} />
      </>
    );
  }

  return (
    <>
      <TopBar titulo="QUIZ COMIC" nivel={NIVEIS[nivel].rotulo} tempo={cronometro.formatado} pontos={pontos} vidas={vidas.desenho} onMenu={aoSair} />
      
      <main className="quiz-main">
        <section className="card-comic">
          <h2 className="card-titulo">
            <span>Pergunta {indice + 1} de {perguntas.length}</span>
          </h2>
          <div className="caixa-dica">
            <span className="icone">💬</span>
            <span>{perguntas[indice]?.p}</span>
          </div>
          <div className={`quiz-opcoes ${opcoesTravadas ? 'travado' : ''}`}>
            {opcoesAtuais.map((op, i) => (
              <BotaoComic
                key={i}
                cor={getCorBotao(op, i)}
                onClick={() => responder(op, i)}
                style={{ pointerEvents: opcoesTravadas ? 'none' : 'auto' }}
              >
                {op}
              </BotaoComic>
            ))}
          </div>
        </section>
      </main>

      <Modal
        aberto={modal.aberto}
        titulo={modal.titulo}
        mensagem={modal.msg}
        placar={modal.placar}
        acoes={
          <>
            <BotaoComic cor="verde" cheio icone="recarregar" onClick={() => trocarNivel(nivel)}>Jogar de novo</BotaoComic>
            <BotaoComic cor="amarelo" cheio onClick={() => setMostrarSeletor(true)}>Trocar nível</BotaoComic>
            <BotaoComic cor="vermelho" cheio icone="casa" onClick={aoSair}>Menu</BotaoComic>
          </>
        }
      />
    </>
  );
}