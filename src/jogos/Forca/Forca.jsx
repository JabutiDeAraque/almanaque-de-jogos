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
import { PALAVRAS } from '../../data/palavras';
import './forca.css';

const TOTAL_PALAVRAS = 5;
const MAX_ERROS = 6;
const PONTOS_ACERTO = 100;
const PONTOS_COM_DICA = 50;
const PAUSA_MS = 2200;
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const semAcento = ch => ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function Forca({ nivelInicial, aoSair }) {
  const [nivel, setNivel] = useState(nivelInicial);
  const [mostrarSeletor, setMostrarSeletor] = useState(!nivelInicial);
  
  const [fila, setFila] = useState([]);
  const [numero, setNumero] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [atual, setAtual] = useState(null);
  const [slots, setSlots] = useState([]);
  const [usadas, setUsadas] = useState(new Set());
  const [erros, setErros] = useState(0);
  const [dicaUsada, setDicaUsada] = useState(false);
  const [travado, setTravado] = useState(false);
  const [errosVisiveis, setErrosVisiveis] = useState(0); // Para as partes do boneco
  const [modal, setModal] = useState({ aberto: false, titulo: '', msg: '', placar: '' });
  const [feliz, setFeliz] = useState(false);
  
  const vidas = useVidas(MAX_ERROS);
  const cronometro = useCronometro();
  const tocarSom = useSom();
  const timeoutRef = useRef(null);

  function iniciar() {
    const sorteadas = embaralhar(PALAVRAS[nivel]).slice(0, TOTAL_PALAVRAS);
    setFila(sorteadas);
    setNumero(0); setPontos(0); setAcertos(0);
    setModal({ aberto: false, titulo: '', msg: '', placar: '' });
    cronometro.zerar(); cronometro.iniciar();
    proximaPalavra(0, sorteadas);
  }

  function proximaPalavra(n, f = fila) {
    const palavra = f[n];
    setAtual(palavra);
    setUsadas(new Set());
    setErros(0);
    setErrosVisiveis(0);
    setDicaUsada(false);
    setTravado(false);
    setFeliz(false);
    vidas.reiniciar();
    setNumero(n + 1);

    // Monta os slots
    const grupos = palavra.palavra.normalize('NFC').split(' ');
    const novosSlots = [];
    grupos.forEach(g => {
      const groupSlots = [...g].map(ch => ({ ch, b: semAcento(ch), aberta: false }));
      novosSlots.push(groupSlots);
    });
    setSlots(novosSlots);
  }

  function apertar(L) {
    if (travado || usadas.has(L) || !atual) return;
    const novasUsadas = new Set(usadas).add(L);
    setUsadas(novasUsadas);

    const acertou = slots.some(g => g.some(s => s.b === L));
    if (acertou) {
      setSlots(prev => prev.map(g => g.map(s => s.b === L ? { ...s, aberta: true } : s)));
      tocarSom('acerto');
      
      const todasAbertas = slots.every(g => g.every(s => s.b !== L ? s.aberta : true));
      if (todasAbertas) {
        terminarPalavra(true);
      }
    } else {
      tocarSom('erro');
      const novosErros = erros + 1;
      setErros(novosErros);
      setErrosVisiveis(novosErros);
      vidas.perder();
      if (novosErros >= MAX_ERROS) {
        terminarPalavra(false);
      }
    }
  }

  function terminarPalavra(ganhou) {
    setTravado(true);
    if (ganhou) {
      const pts = dicaUsada ? PONTOS_COM_DICA : PONTOS_ACERTO;
      setAcertos(a => a + 1);
      setPontos(p => p + pts);
      setFeliz(true);
      tocarSom('vitoria');
    } else {
      setSlots(prev => prev.map(g => g.map(s => s.aberta ? s : { ...s, aberta: true, perdida: true })));
    }

    timeoutRef.current = setTimeout(() => {
      if (numero >= fila.length) terminar();
      else proximaPalavra(numero);
    }, PAUSA_MS);
  }

  function terminar() {
    cronometro.parar();
    setModal({
      aberto: true,
      titulo: acertos === fila.length ? 'Perfeito! 🎉' : acertos >= 3 ? 'Mandou bem! 👏' : 'Quase lá! 💪',
      msg: 'Fim das palavras desta rodada.',
      placar: `${acertos} de ${fila.length} palavras · ${pontos} pontos · ${cronometro.formatado}`
    });
    tocarSom(acertos >= 3 ? 'vitoria' : 'erro');
  }

  useEffect(() => {
    if (!nivel || mostrarSeletor) return;
    iniciar();
    return () => clearTimeout(timeoutRef.current);
  }, [nivel, mostrarSeletor]);

  useEffect(() => {
    function onKeyDown(e) {
      if (!nivel || mostrarSeletor || modal.aberto || travado) return;
      if (e.key.length !== 1) return;
      const L = semAcento(e.key).toUpperCase();
      if (ALFABETO.includes(L)) apertar(L);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [nivel, mostrarSeletor, modal.aberto, travado, usadas, slots, atual]);

  function trocarNivel(id) {
    setNivel(id);
    setMostrarSeletor(false);
  }

  if (mostrarSeletor) {
    return (
      <>
        <div className="topbar"><h1 className="titulo-comic vermelho pequeno">FORÇA MALUCA</h1></div>
        <SeletorNivel aberto={true} aoEscolher={trocarNivel} aoVoltar={aoSair} />
      </>
    );
  }

  return (
    <>
      <TopBar 
        titulo="FORÇA MALUCA" 
        nivel={NIVEIS[nivel].rotulo} 
        tempo={cronometro.formatado} 
        pontos={pontos} 
        vidas={vidas.desenho} 
        extra={<BotaoComic cor="amarelo" cheio pequeno onClick={() => { if (!travado && !dicaUsada) { setDicaUsada(true); } }} disabled={travado || dicaUsada}>💡 Dica</BotaoComic>}
        onMenu={aoSair} 
      />
      
      <main className="forca-main">
        <section className="card-comic boneco-card" aria-label="Boneco">
          <h2 className="card-titulo">
            <span>O boneco</span>
            <span className="selo-pill">{erros} / {MAX_ERROS} erros</span>
          </h2>
          <svg id="boneco" className={feliz ? 'feliz' : ''} viewBox="0 0 240 300" role="img">
            <rect className="palco" x="26" y="262" width="188" height="28" rx="10" />
            <g className={`parte ${errosVisiveis >= 5 ? 'visivel' : ''}`}><path className="borda" d="M106 192 L98 250"/><path className="perna" d="M106 192 L98 250"/><ellipse className="sapato contorno" cx="92" cy="255" rx="17" ry="8"/></g>
            <g className={`parte ${errosVisiveis >= 6 ? 'visivel' : ''}`}><path className="borda" d="M134 192 L142 250"/><path className="perna" d="M134 192 L142 250"/><ellipse className="sapato contorno" cx="148" cy="255" rx="17" ry="8"/></g>
            <g className={`parte ${errosVisiveis >= 3 ? 'visivel' : ''}`}><path className="borda" d="M94 124 L52 168"/><path className="braco" d="M94 124 L52 168"/><circle className="pele contorno" cx="48" cy="172" r="11"/></g>
            <g className={`parte ${errosVisiveis >= 4 ? 'visivel' : ''}`}><path className="borda" d="M146 124 L188 168"/><path className="braco" d="M146 124 L188 168"/><circle className="pele contorno" cx="192" cy="172" r="11"/></g>
            <g className={`parte ${errosVisiveis >= 2 ? 'visivel' : ''}`}><rect className="camisa contorno" x="88" y="104" width="64" height="92" rx="16"/><circle cx="120" cy="150" r="9" fill="#fff" className="contorno" style={{ strokeWidth: 4 }}/></g>
            <g className={`parte ${errosVisiveis >= 1 ? 'visivel' : ''}`}><circle className="pele contorno" cx="120" cy="68" r="38"/><path className="tracos" d="M98 44 Q120 20 142 44"/><circle className="olho" cx="107" cy="66" r="5"/><circle className="olho" cx="133" cy="66" r="5"/><path className="tracos" d="M106 82 Q120 96 134 82"/></g>
          </svg>
        </section>

        <section className="card-comic">
          <h2 className="card-titulo">
            <span>Palavra {numero} de {fila.length}</span>
            <span className="selo-pill grande">📂 {atual?.categoria}</span>
          </h2>
          <div className="caixa-dica">
            <span className="icone">💡</span>
            <span>{dicaUsada ? atual?.dica : 'Se precisar, toque em "💡 Dica" lá em cima.'}</span>
          </div>
          <div className="palavra">
            {slots.map((grupo, gi) => (
              <div key={gi} className="grupo">
                {grupo.map((s, si) => (
                  <div key={si} className={`slot ${s.aberta ? 'aberta' : ''} ${s.perdida ? 'perdida' : ''} ${travado && s.aberta && !s.perdida ? 'ganhou' : ''}`}>
                    {s.aberta ? s.ch : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className={`letras ${travado ? 'travado' : ''}`}>
            {ALFABETO.map(L => {
              const usada = usadas.has(L);
              const acertouLetra = usada && slots.some(g => g.some(s => s.b === L));
              return (
                <button key={L} className={`letra ${usada ? (acertouLetra ? 'certa' : 'errada') : ''}`} onClick={() => apertar(L)}>
                  {L}
                </button>
              );
            })}
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
            <BotaoComic cor="verde" cheio icone="recarregar" onClick={iniciar}>Jogar de novo</BotaoComic>
            <BotaoComic cor="amarelo" cheio onClick={() => setMostrarSeletor(true)}>Trocar nível</BotaoComic>
            <BotaoComic cor="vermelho" cheio icone="casa" onClick={aoSair}>Menu</BotaoComic>
          </>
        }
      />
    </>
  );
}