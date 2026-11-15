import React, { useState, useEffect, useRef } from 'react';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import SeletorNivel from '../../components/SeletorNivel';
import BotaoComic from '../../components/BotaoComic';
import { useCronometro } from '../../hooks/useCronometro';
import { useSom } from '../../hooks/useSom';
import { embaralhar } from '../../lib/embaralhar';
import { NIVEIS } from '../../lib/niveis';
import { PERGUNTAS_CORRIDA } from '../../data/perguntasCorrida';
import { gerarConta, CFG } from '../../lib/gerador';
import './corrida.css';

const CONFIG_CORRIDA = {
  facil:   { passos: 3, tempo: 20 },
  medio:   { passos: 4, tempo: 15 },
  dificil: { passos: 5, tempo: 15 },
  desafio: { passos: 7, tempo: 12 },
};
const BLOQUEIO_MS = 1500;
const PAUSA_MS = 1400;
const IMAGENS = { fundoPista: '', cerebroAzul: 'assets/cerebro-azul.png', cerebroVermelho: 'assets/cerebro-vermelho.png' };
const JOGADORES = {
  azul: { nome: 'Cérebro Azul', bolinha: '🔵', img: IMAGENS.cerebroAzul },
  vermelho: { nome: 'Cérebro Vermelho', bolinha: '🔴', img: IMAGENS.cerebroVermelho },
};

type NivelCorrida = keyof typeof CONFIG_CORRIDA;

type CorridaProps = {
  nivelInicial?: NivelCorrida | null;
  aoSair: () => void;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export default function Corrida({ nivelInicial, aoSair }: CorridaProps) {
  const [nivel, setNivel] = useState(nivelInicial ?? null as NivelCorrida | null);
  const [mostrarSeletor, setMostrarSeletor] = useState(!nivelInicial);
  
  const [passos, setPassos] = useState({ azul: 0, vermelho: 0 });
  const [questao, setQuestao] = useState(null);
  const [fase, setFase] = useState('aberta');
  const [mensagem, setMensagem] = useState('');
  const [bloqueado, setBloqueado] = useState({ azul: false, vermelho: false });
  const [erros, setErros] = useState({ azul: new Set(), vermelho: new Set() });
  const [barraLargura, setBarraLargura] = useState(100);
  const [modal, setModal] = useState({ aberto: false, titulo: '', msg: '', placar: '' });
  const [pulos, setPulos] = useState({ azul: false, vermelho: false });

  const turnoRef = useRef(0);
  const bancoQuizRef = useRef([]);
  const vistasContasRef = useRef(new Set());
  const timersBloqueioRef = useRef({ azul: null, vermelho: null });
  const timerPerguntaRef = useRef(null);
  const timeoutProximaRef = useRef(null);

  const cronometro = useCronometro();
  const tocarSom = useSom();
  const cfg = nivel ? CONFIG_CORRIDA[nivel] : CONFIG_CORRIDA.facil;

  function proximaDoBanco() {
    if (!bancoQuizRef.current.length) bancoQuizRef.current = embaralhar(PERGUNTAS_CORRIDA[nivel]);
    return bancoQuizRef.current.pop();
  }

  function distratores(v) {
    const saltos = v >= 20 ? [1, 2, 3, 10, -1, -2, -3, -10] : [1, 2, 3, 4, -1, -2, -3, -4];
    const achados = new Set();
    embaralhar(saltos).forEach(d => { const x = v + d; if (x >= 0 && x !== v && achados.size < 3) achados.add(x); });
    for (let k = 5; achados.size < 3; k++) achados.add(v + k);
    return [...achados].map(String);
  }

  function montarQuiz() {
    const q = proximaDoBanco();
    return { tipo: 'quiz', rotulo: 'Pergunta', texto: q.p, opcoes: embaralhar([q.certa, ...q.erradas]), certa: q.certa };
  }

  function montarConta() {
    let c, tentativas = 0;
    do { c = gerarConta(nivel, vistasContasRef.current); tentativas++; }
    while (nivel === 'facil' && c.espera === 'op' && tentativas < 40);
    const texto = c.partes.map(p => p === null ? '?' : p).join(' ');
    const opcoes = c.espera === 'op' ? CFG[nivel].ops.slice() : [c.resposta, ...distratores(Number(c.resposta))];
    return { tipo: 'conta', rotulo: 'Conta', texto, opcoes: embaralhar(opcoes), certa: c.resposta };
  }

  function iniciarTempo() {
    clearInterval(timerPerguntaRef.current);
    const total = cfg.tempo * 1000;
    const t0 = Date.now();
    setBarraLargura(100);

    timerPerguntaRef.current = setInterval(() => {
      const resta = total - (Date.now() - t0);
      const p = Math.max(0, resta / total);
      setBarraLargura(p * 100);
      if (resta <= 0) tempoEsgotado();
    }, 100);
  }

  function tempoEsgotado() {
    if (fase !== 'aberta') return;
    setFase('fechada');
    clearInterval(timerPerguntaRef.current);
    tocarSom('erro');
    setMensagem(`⏰ Ninguém acertou! Era "${questao.certa}".`);
    timeoutProximaRef.current = setTimeout(proxima, PAUSA_MS);
  }

  function proxima() {
    setBloqueado({ azul: false, vermelho: false });
    clearTimeout(timersBloqueioRef.current.azul);
    clearTimeout(timersBloqueioRef.current.vermelho);
    setErros({ azul: new Set(), vermelho: new Set() });
    setPulos({ azul: false, vermelho: false });
    turnoRef.current++;
    
    const q = turnoRef.current % 2 ? montarConta() : montarQuiz();
    setQuestao(q);
    setMensagem('');
    setFase('aberta');
    iniciarTempo();
  }

  function iniciar() {
    setPassos({ azul: 0, vermelho: 0 });
    bancoQuizRef.current = [];
    vistasContasRef.current = new Set();
    turnoRef.current = Math.floor(Math.random() * 2);
    setModal({ aberto: false, titulo: '', msg: '', placar: '' });
    cronometro.zerar();
    cronometro.iniciar();
    proxima();
  }

  useEffect(() => {
    if (!nivel || mostrarSeletor) return;
    iniciar();
    return () => {
      clearInterval(timerPerguntaRef.current);
      clearTimeout(timeoutProximaRef.current);
      clearTimeout(timersBloqueioRef.current.azul);
      clearTimeout(timersBloqueioRef.current.vermelho);
    };
  }, [nivel, mostrarSeletor]);

  function tocar(j, i) {
    if (fase !== 'aberta' || bloqueado[j] || erros[j].has(i)) return;
    if (questao.opcoes[i] === questao.certa) {
      setFase('fechada');
      clearInterval(timerPerguntaRef.current);
      
      const novosPassos = { ...passos, [j]: passos[j] + 1 };
      setPassos(novosPassos);
      setPulos(prev => ({ ...prev, [j]: true }));
      setMensagem(`${JOGADORES[j].bolinha} ${JOGADORES[j].nome} acertou e avança!`);
      tocarSom('acerto');
      
      timeoutProximaRef.current = setTimeout(() => {
        if (novosPassos[j] >= cfg.passos) vencer(j, novosPassos);
        else proxima();
      }, PAUSA_MS);
      return;
    }

    // Errou
    const novosErros = { ...erros, [j]: new Set(erros[j]).add(i) };
    setErros(novosErros);
    setBloqueado(prev => ({ ...prev, [j]: true }));
    tocarSom('erro');

    timersBloqueioRef.current[j] = setTimeout(() => {
      setBloqueado(prev => ({ ...prev, [j]: false }));
    }, BLOQUEIO_MS);
  }

  function vencer(j, novosPassos) {
    setFase('fim');
    cronometro.parar();
    tocarSom('vitoria');
    setModal({
      aberto: true,
      titulo: `${JOGADORES[j].bolinha} ${JOGADORES[j].nome} venceu!`,
      msg: 'Chegou primeiro ao FINAL! 🏁',
      placar: `Azul ${novosPassos.azul} x ${novosPassos.vermelho} Vermelho · ${cronometro.formatado}`
    });
  }

  // Teclado físico
  useEffect(() => {
    function onKeyDown(e) {
      if (!nivel || mostrarSeletor || modal.aberto) return;
      const mapa = { 1: ['azul', 0], 2: ['azul', 1], 3: ['azul', 2], 4: ['azul', 3], 7: ['vermelho', 0], 8: ['vermelho', 1], 9: ['vermelho', 2], 0: ['vermelho', 3] };
      const m = mapa[e.key]; if (m) tocar(m[0], m[1]);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [nivel, mostrarSeletor, modal.aberto, fase, questao, bloqueado, erros, passos]);

  function trocarNivel(id) {
    setNivel(id);
    setMostrarSeletor(false);
  }

  if (mostrarSeletor) {
    return (
      <>
        <div className="topbar"><h1 className="titulo-comic vermelho pequeno">CORRIDA DA MENTE</h1></div>
        <SeletorNivel aberto={true} aoEscolher={trocarNivel} aoVoltar={aoSair} />
      </>
    );
  }

  return (
    <>
      <TopBar 
        titulo="CORRIDA DA MENTE"
        nivel={NIVEIS[nivel].rotulo}
        tempo={cronometro.formatado}
        chipsExtras={<>
          <span className="chip azul" style={{ width: 'auto' }}>{JOGADORES.azul.bolinha} {passos.azul}/{cfg.passos}</span>
          <span className="chip vermelho">{JOGADORES.vermelho.bolinha} {passos.vermelho}/{cfg.passos}</span>
        </>}
        onMenu={aoSair} pontos={undefined} vidas={undefined} extra={undefined}      />
      
      <main className="arena">
        <section className="pista" aria-label="Pista de corrida">
          <div className="asfalto"></div>
          <div>
            {Array.from({ length: cfg.passos - 1 }).map((_, i) => (
              <div key={i} className="marca" style={{ '--prog': (i + 1) / cfg.passos }} />
            ))}
          </div>
          <div className="linha-final"></div>
          <div className="placa-final"><span className="titulo-comic">FINAL</span></div>
          
          <div className="raia vermelho">
            <div className={`cerebro vermelho ${pulos.vermelho ? 'pulou' : ''}`} style={{ '--prog': passos.vermelho / cfg.passos }}>
              <span className="corpo">
                {JOGADORES.vermelho.img ? <img src={JOGADORES.vermelho.img} alt={JOGADORES.vermelho.nome} /> : <>🧠<i className="bandana"></i></>}
              </span>
            </div>
          </div>
          <div className="raia azul">
            <div className={`cerebro azul ${pulos.azul ? 'pulou' : ''}`} style={{ '--prog': passos.azul / cfg.passos }}>
              <span className="corpo">
                {JOGADORES.azul.img ? <img src={JOGADORES.azul.img} alt={JOGADORES.azul.nome} /> : <>🧠<i className="bandana"></i></>}
              </span>
            </div>
          </div>
        </section>

        <section className="zona">
          <div className={`lado azul ${bloqueado.azul ? 'bloqueado' : ''}`}>
            <span className="nome-jogador titulo-comic branco">🔵 AZUL</span>
            <div className="cadeado">⏳ Espere um pouquinho!</div>
            <div className="opcoes">
              {questao?.opcoes.map((op, i) => {
                const isErro = erros.azul.has(i);
                const isCerta = fase === 'fechada' && op === questao.certa;
                return (
                  <button key={i} className={`opcao ${isErro ? 'errada' : ''} ${isCerta ? 'certa' : ''}`} onPointerDown={(e) => { e.preventDefault(); tocar('azul', i); }} onClick={(e) => { if (e.detail === 0) tocar('azul', i); }}>
                    {op}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className={`lado vermelho ${bloqueado.vermelho ? 'bloqueado' : ''}`}>
            <span className="nome-jogador titulo-comic branco">VERMELHO 🔴</span>
            <div className="cadeado">⏳ Espere um pouquinho!</div>
            <div className="opcoes">
              {questao?.opcoes.map((op, i) => {
                const isErro = erros.vermelho.has(i);
                const isCerta = fase === 'fechada' && op === questao.certa;
                return (
                  <button key={i} className={`opcao ${isErro ? 'errada' : ''} ${isCerta ? 'certa' : ''}`} onPointerDown={(e) => { e.preventDefault(); tocar('vermelho', i); }} onClick={(e) => { if (e.detail === 0) tocar('vermelho', i); }}>
                    {op}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-comic pergunta-box">
            <span className={`selo-tipo ${questao?.tipo === 'conta' ? 'conta' : 'pergunta'}`}>
              {questao?.rotulo}
            </span>

            <div className={`texto ${questao?.tipo === 'conta' ? 'conta' : ''}`}>
              {questao?.texto}
            </div>
            
            <div className="msg">{mensagem}</div>
            
            <div className="barra-tempo">
              <i style={{ width: `${barraLargura}%` }} className={barraLargura < 34 ? 'pouco' : ''}></i>
            </div>
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
            <BotaoComic cor="verde" cheio icone="recarregar" onClick={iniciar}>Revanche</BotaoComic>
            <BotaoComic cor="amarelo" cheio onClick={() => setMostrarSeletor(true)}>Trocar nível</BotaoComic>
            <BotaoComic cor="vermelho" cheio icone="casa" onClick={aoSair}>Menu</BotaoComic>
          </>
        }
      />
    </>
  );
}