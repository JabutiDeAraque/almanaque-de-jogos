import { useState, useEffect, useRef, useCallback } from 'react';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import SeletorNivel from '../../components/SeletorNivel';
import BotaoComic from '../../components/BotaoComic';
import { useCronometro } from '../../hooks/useCronometro';
import { useVidas } from '../../hooks/useVidas';
import { useSom } from '../../hooks/useSom';
import { gerarConta, TODOS_SINAIS, CFG } from '../../lib/gerador';
import { NIVEIS } from '../../lib/niveis';
import './calculadora.css';

const TOTAL_CONTAS = 8;
const PONTOS_ACERTO = 100;
const PAUSA_MS = 1500;
const MAX_DIGITOS = 4;
const LAYOUT = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '⌫', '=', '+'];

export default function Calculadora({ nivelInicial, aoSair }) {
  const [nivel, setNivel] = useState(nivelInicial);
  const [mostrarSeletor, setMostrarSeletor] = useState(!nivelInicial);
  
  const [numero, setNumero] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [conta, setConta] = useState(null);
  const [entrada, setEntrada] = useState('');
  const [travado, setTravado] = useState(false);
  const [lacunaStatus, setLacunaStatus] = useState('lacuna');
  const [modal, setModal] = useState({ aberto: false, titulo: '', msg: '', placar: '' });
  
  const vistasRef = useRef(new Set());
  const cronometro = useCronometro();
  const vidas = useVidas(3);
  const tocarSom = useSom();
  const timeoutRef = useRef(null);

  // Função separada para gerar a próxima conta
  const proximaConta = useCallback((n) => {
    const c = gerarConta(nivel, vistasRef.current);
    setConta(c);
    setEntrada('');
    setTravado(false);
    setLacunaStatus('lacuna');
    setNumero(n + 1);
  }, [nivel]);

  // Inicia o jogo quando o nível muda ou é definido
  useEffect(() => {
    if (!nivel) return;
    
    // Limpa timeouts pendentes se houver
    clearTimeout(timeoutRef.current);

    setPontos(0);
    vistasRef.current = new Set();
    vidas.reiniciar();
    setModal({ aberto: false, titulo: '', msg: '', placar: '' });
    cronometro.zerar();
    cronometro.iniciar();
    
    // Chama a geração da conta usando o nível atual
    proximaConta(0);
  }, [nivel]); // Dependência apenas do nível

  function aviso() {
    const el = document.getElementById('tela-calc');
    if (el) {
      el.classList.remove('aviso');
      void el.offsetWidth;
      el.classList.add('aviso');
    }
  }

  function apertar(t) {
    if (travado || !conta) return;
    
    if (t === '⌫') {
      setEntrada(prev => prev.slice(0, -1));
      return;
    }
    if (t === '=') {
      confirmar();
      return;
    }
    if (/^\d$/.test(t)) {
      if (conta.espera !== 'num' || entrada.length >= MAX_DIGITOS) return aviso();
      setEntrada(prev => (prev === '0' ? '' : prev) + t);
      return;
    }
    // sinal
    if (conta.espera !== 'op') return aviso();
    setEntrada(t);
  }

  function confirmar() {
    if (entrada === '') return aviso();
    setTravado(true);
    
    if (entrada === conta.resposta) {
      setPontos(p => p + PONTOS_ACERTO);
      setLacunaStatus('certo');
      tocarSom('acerto');
    } else {
      setLacunaStatus('errado');
      vidas.perder();
      tocarSom('erro');
    }

    timeoutRef.current = setTimeout(() => {
      // Usa o valor atualizado de vidas.restantes e numero
      if (vidas.restantes <= 1 || numero >= TOTAL_CONTAS) {
        terminar();
      } else {
        proximaConta(numero);
      }
    }, PAUSA_MS);
  }

  function terminar() {
    cronometro.parar();
    const venceu = vidas.restantes > 0;
    const acertos = pontos / PONTOS_ACERTO;
    setModal({
      aberto: true,
      titulo: venceu ? (acertos === TOTAL_CONTAS ? 'Calculadora consertada! 🎉' : 'Mandou bem! 👏') : 'Acabaram as vidas! 💔',
      msg: venceu ? 'Você chegou ao fim das contas.' : 'Mas dá pra tentar de novo!',
      placar: `${acertos} de ${TOTAL_CONTAS} acertos · ${pontos} pontos · ${cronometro.formatado}`
    });
    tocarSom(venceu ? 'vitoria' : 'erro');
  }

  // Teclado físico
  useEffect(() => {
    function onKeyDown(e) {
      if (!nivel || mostrarSeletor || modal.aberto || travado) return;
      const mapa = { '+': '+', '-': '−', '*': '×', 'x': '×', '/': '÷', Backspace: '⌫', Enter: '=', '=': '=' };
      const t = /^\d$/.test(e.key) ? e.key : mapa[e.key];
      if (!t) return;
      
      const ehSinal = TODOS_SINAIS.includes(t);
      const quebrada = ehSinal && !CFG[nivel]?.ops.includes(t);
      if (!quebrada) apertar(t);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [nivel, mostrarSeletor, modal.aberto, travado, entrada, conta]);

  function trocarNivel(id) {
    setNivel(id);
    setMostrarSeletor(false);
  }

  if (mostrarSeletor) {
    return (
      <>
        <div className="topbar"><h1 className="titulo-comic vermelho pequeno">CALCULADORA QUEBRADA</h1></div>
        <SeletorNivel aberto={true} aoEscolher={trocarNivel} aoVoltar={aoSair} />
      </>
    );
  }

  return (
    <>
      <TopBar 
        titulo="CALCULADORA QUEBRADA" 
        nivel={NIVEIS[nivel]?.rotulo || '...'} 
        tempo={cronometro.formatado} 
        pontos={pontos} 
        vidas={vidas.desenho} 
        onMenu={aoSair} 
      />
      
      <main className="calc-main">
        <section className="card-comic calc-card" aria-label="Calculadora">
          <div className="tela" id="tela-calc">
            <svg className="trinca" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
              <path d="M100 0 L74 17 L81 26 L56 39 L61 48 L42 60 M74 17 L62 13 M56 39 L69 44"/>
            </svg>
            <span className="visor">{entrada || '0'}</span>
          </div>
          <div className={`teclas ${travado ? 'travado' : ''}`}>
            {LAYOUT.map(t => {
              const ehSinal = TODOS_SINAIS.includes(t);
              const quebrada = ehSinal && !CFG[nivel]?.ops.includes(t);
              const classes = ['tecla', ehSinal ? 'sinal' : '', t === '=' ? 'igual' : '', t === '⌫' ? 'apagar' : '', quebrada ? 'quebrada' : ''].filter(Boolean).join(' ');
              return (
                <button key={t} className={classes} onClick={() => apertar(t)} disabled={quebrada}>
                  {t}
                </button>
              );
            })}
          </div>
        </section>

        <section className="card-comic conta-card">
          <h2 className="card-titulo">
            <span>{conta ? `Conta ${numero} de ${TOTAL_CONTAS}` : 'Carregando...'}</span>
          </h2>
          <div className="caixa-dica">
            <span className="icone">🔧</span>
            <span>{conta ? conta.instrucao : 'Prepare-se...'}</span>
          </div>
          
          {/* Renderização condicional para evitar erro quando conta é null */}
          <div className="conta">
            {conta ? (
              conta.partes.map((p, i) => {
                const isLacuna = i === conta.lacuna;
                const classes = ['parteCalculadora', i === 1 ? 'sinal' : '', i === 3 ? 'igual' : '', isLacuna ? lacunaStatus : ''].filter(Boolean).join(' ');
                return (
                  <div key={i} className={classes}>
                    {isLacuna ? (entrada || '?') : p}
                  </div>
                );
              })
            ) : (
              <div className="parteCalculadora lacuna" style={{ minWidth: '100%' }}>?</div>
            )}
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