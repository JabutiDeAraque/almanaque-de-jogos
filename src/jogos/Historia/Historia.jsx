import { useState, useEffect, useRef } from 'react';
import  TopBar  from '../../components/TopBar';
import  Modal  from '../../components/Modal';
import  SeletorNivel  from '../../components/SeletorNivel';
import  BotaoComic  from '../../components/BotaoComic';
import { useCronometro } from '../../hooks/useCronometro';
import { useVidas } from '../../hooks/useVidas';
import { useSom } from '../../hooks/useSom';
import { embaralhar } from '../../lib/embaralhar';
import { NIVEIS } from '../../lib/niveis';
import { HISTORIAS } from '../../data/historias';
import './historia.css';

const TOTAL_HISTORIAS = 3;
const PONTOS_BASE = 100;
const PENALIDADE = 25;
const PONTOS_MINIMO = 25;
const PAUSA_MS = 1300;

const CFG = {
  facil:   { modo: 'imediato', tentativas: Infinity, marcar: true,  mostrarTitulo: true  },
  medio:   { modo: 'conferir', tentativas: 4,        marcar: true,  mostrarTitulo: true  },
  dificil: { modo: 'conferir', tentativas: 3,        marcar: false, mostrarTitulo: true  },
  desafio: { modo: 'conferir', tentativas: 3,        marcar: false, mostrarTitulo: false },
};

export default function Historia({ nivelInicial, aoSair }) {
  const [nivel, setNivel] = useState(nivelInicial);
  const [mostrarSeletor, setMostrarSeletor] = useState(!nivelInicial);
  
  const [fila, setFila] = useState([]);
  const [numero, setNumero] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [completas, setCompletas] = useState(0);
  const [historia, setHistoria] = useState(null);
  const [seq, setSeq] = useState([]);
  const [pool, setPool] = useState([]);
  const [fixas, setFixas] = useState(new Set());
  const [erros, setErros] = useState(0);
  const [travado, setTravado] = useState(false);
  const [marcando, setMarcando] = useState(false);
  const [revelando, setRevelando] = useState(false);
  const [ultimo, setUltimo] = useState(null);
  const [tela, setTela] = useState('jogo'); // 'jogo' ou 'leitura'
  const [leituraDados, setLeituraDados] = useState({ ganhou: false, pts: 0 });
  const [modal, setModal] = useState({ aberto: false, titulo: '', msg: '', placar: '' });
  const [instrucao, setInstrucao] = useState('');
  
  const vidas = useVidas(CFG[nivel]?.tentativas || 1);
  const cronometro = useCronometro();
  const tocarSom = useSom();
  const timeoutRef = useRef(null);

  function ordemMisturada(n) {
    let ids;
    do { ids = embaralhar([...Array(n).keys()]); } while (ids.every((id, i) => id === i));
    return ids;
  }

  function iniciar() {
    const sorteadas = embaralhar(HISTORIAS[nivel]).slice(0, TOTAL_HISTORIAS);
    setFila(sorteadas);
    setNumero(0); setPontos(0); setCompletas(0);
    setModal({ aberto: false, titulo: '', msg: '', placar: '' });
    cronometro.zerar(); cronometro.iniciar();
    proximaHistoria(0, sorteadas);
  }

  function proximaHistoria(n, f = fila) {
    const hist = f[n];
    setHistoria(hist);
    const nCenas = hist.cenas.length;
    setSeq(Array(nCenas).fill(null));
    setPool(ordemMisturada(nCenas));
    setFixas(new Set());
    setErros(0);
    setTravado(false);
    setMarcando(false);
    setRevelando(false);
    setUltimo(null);
    setTela('jogo');
    setNumero(n + 1);

    const cfg = CFG[nivel];
    if (cfg.tentativas === Infinity) {
      vidas.reiniciar();
      setInstrucao('Toque nas cenas na ordem em que acontecem. Se a cena não for a próxima, ela não encaixa!');
    } else {
      vidas.reiniciar();
      setInstrucao('Toque nas cenas na ordem certa. Quando todas estiverem no lugar, toque em Conferir.');
    }
  }

  function tocarPool(id) {
    if (travado) return;
    const i = seq.indexOf(null);
    if (i < 0) return;
    if (CFG[nivel].modo === 'imediato' && id !== i) {
      setErros(e => e + 1);
      tocarSom('erro');
      return;
    }
    const novoSeq = [...seq];
    novoSeq[i] = id;
    setSeq(novoSeq);
    setPool(prev => prev.filter(x => x !== id));
    setUltimo(id);
    if (CFG[nivel].modo === 'imediato') {
      setFixas(prev => new Set(prev).add(id));
      tocarSom('acerto');
    }
    if (CFG[nivel].modo === 'imediato' && pool.length === 1) {
      // Ganhou
      setTravado(true);
      setCompletas(c => c + 1);
      const pts = Math.max(PONTOS_MINIMO, PONTOS_BASE - PENALIDADE * erros);
      setPontos(p => p + pts);
      setLeituraDados({ ganhou: true, pts });
      timeoutRef.current = setTimeout(() => setTela('leitura'), 900);
      tocarSom('vitoria');
    }
  }

  function tocarSequencia(pos) {
    if (travado || CFG[nivel].modo === 'imediato') return;
    const id = seq[pos];
    if (id === null || fixas.has(id)) return;
    const novoSeq = [...seq];
    novoSeq[pos] = null;
    setSeq(novoSeq);
    setPool(p => [...p, id]);
    setUltimo(null);
  }

  function conferir() {
    if (travado || seq.includes(null)) return;
    const n = seq.length;
    const certas = seq.filter((id, i) => id === i).length;
    if (certas === n) {
      // Ganhou
      setTravado(true);
      setCompletas(c => c + 1);
      const pts = Math.max(PONTOS_MINIMO, PONTOS_BASE - PENALIDADE * erros);
      setPontos(p => p + pts);
      setLeituraDados({ ganhou: true, pts });
      timeoutRef.current = setTimeout(() => setTela('leitura'), 900);
      tocarSom('vitoria');
      return;
    }

    setErros(e => e + 1);
    tocarSom('erro');
    
    if (vidas.restantes === 1) {
      // Perdeu
      setTravado(true);
      setRevelando(true);
      setSeq(historia.cenas.map((_, i) => i));
      setPool([]);
      setFixas(new Set());
      setInstrucao('Acabaram as tentativas. Olha como era a ordem certa!');
      timeoutRef.current = setTimeout(() => {
        setTela('leitura');
        setLeituraDados({ ganhou: false, pts: 0 });
      }, 2200);
      return;
    }
    
    vidas.perder();
    
    if (CFG[nivel].marcar) {
      setTravado(true);
      setMarcando(true);
      setFixas(prev => {
        const novo = new Set(prev);
        seq.forEach((id, i) => { if (id === i) novo.add(id); });
        return novo;
      });
      setInstrucao(`Você acertou ${certas} de ${n}! As cenas erradas já voltam para você tentar de novo.`);
      timeoutRef.current = setTimeout(() => {
        setSeq(prev => prev.map((id, i) => {
          if (id !== i) {
            setPool(p => [...p, id]);
            return null;
          }
          return id;
        }));
        setMarcando(false);
        setTravado(false);
        setInstrucao('Encaixe as cenas que faltam e toque em Conferir.');
      }, PAUSA_MS);
    } else {
      setInstrucao(`Você acertou ${certas} de ${n} cenas no lugar certo. Troque algumas e confira de novo!`);
    }
  }

  function terminar() {
    cronometro.parar();
    setModal({
      aberto: true,
      titulo: completas === fila.length ? 'Perfeito! 🎉' : completas >= 2 ? 'Mandou bem! 👏' : 'Quase lá! 💪',
      msg: 'Fim das histórias desta rodada.',
      placar: `${completas} de ${fila.length} histórias · ${pontos} pontos · ${cronometro.formatado}`
    });
    tocarSom(completas >= 2 ? 'vitoria' : 'erro');
  }

  function avancar() {
    if (numero >= fila.length) terminar();
    else proximaHistoria(numero);
  }

  useEffect(() => {
    if (!nivel || mostrarSeletor) return;
    iniciar();
    return () => clearTimeout(timeoutRef.current);
  }, [nivel, mostrarSeletor]);

  function trocarNivel(id) {
    setNivel(id);
    setMostrarSeletor(false);
  }

  if (mostrarSeletor) {
    return (
      <>
        <div className="topbar"><h1 className="titulo-comic vermelho pequeno">ORDENE A HISTÓRIA</h1></div>
        <SeletorNivel aberto={true} aoEscolher={trocarNivel} aoVoltar={aoSair} />
      </>
    );
  }

  const cfg = CFG[nivel];

  return (
    <>
      <TopBar 
        titulo="ORDENE A HISTÓRIA" 
        nivel={NIVEIS[nivel].rotulo} 
        tempo={cronometro.formatado} 
        pontos={pontos} 
        vidas={cfg.tentativas === Infinity ? '😊 sem limite' : vidas.desenho} 
        onMenu={aoSair} 
      />
      
      <main className="hist-main">
        {tela === 'jogo' && (
          <section className="card-comic">
            <h2 className="card-titulo">
              <span>História {numero} de {fila.length}</span>
              <span className="selo-pill grande">{cfg.mostrarTitulo ? `📚 ${historia?.titulo}` : '❓ Que história é esta?'}</span>
            </h2>
            <div className="caixa-dica"><span className="icone">📖</span><span>{instrucao}</span></div>

            <h3 className="rotulo">Sua história</h3>
            <div className="grade">
              {seq.map((id, i) => {
                const proxima = seq.indexOf(null);
                return (
                  <div key={i} className={`vaga ${id !== null ? 'cheia' : ''} ${i === proxima && !travado ? 'proxima' : ''}`}>
                    {id === null ? (
                      <span className="num">{i + 1}</span>
                    ) : (
                      <button className={`cena ${fixas.has(id) ? 'fixa' : ''} ${marcando && id !== i ? 'errada' : ''} ${revelando ? 'perdida' : ''} ${id === ultimo ? 'pop' : ''}`} onClick={() => tocarSequencia(i)}>
                        <span className="icone-cena">{historia.cenas[id].icone || '🎬'}</span>
                        <span className="texto">{historia.cenas[id].texto}</span>
                        <span className="badge">{i + 1}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 className="rotulo">Cenas misturadas</h3>
            <div className="grade">
              {pool.map(id => (
                <button key={id} className={`cena ${id === ultimo ? 'pop' : ''}`} onClick={() => tocarPool(id)}>
                  <span className="icone-cena">{historia.cenas[id].icone || '🎬'}</span>
                  <span className="texto">{historia.cenas[id].texto}</span>
                </button>
              ))}
            </div>

            {cfg.modo === 'conferir' && (
              <div className="barra-acoes">
                <BotaoComic cor="verde" cheio onClick={conferir} disabled={travado || seq.includes(null)}>Conferir ✅</BotaoComic>
              </div>
            )}
          </section>
        )}

        {tela === 'leitura' && (
          <section className="card-comic">
            <h2 className="card-titulo">
              <span>{leituraDados.ganhou ? '🎉 Isso aí!' : 'Quase lá!'}</span>
              <span className="selo-pill grande">+{leituraDados.pts} pontos</span>
            </h2>

            {historia?.imagem && (
                <img
                    src={historia.imagem}
                    alt={`Ilustração: ${historia.titulo}`}
                    style={{
                    width: '100%',
                    objectFit: 'cover',
                    border: 'var(--border-comic)',
                    borderRadius: 18,
                    boxShadow: 'var(--shadow-comic-lg)',
                    marginBottom: 22,
                    }}
                />
            )}

            <h3 className="titulo-leitura">{historia?.icone || '📖'} {historia?.titulo}</h3>
            <p className="texto-historia">{historia?.cenas.map(c => c.texto).join(' ')}</p>
            <div className="barra-acoes" style={{ marginTop: 0 }}>
              <BotaoComic cor="verde" cheio onClick={avancar}>
                {numero >= fila.length ? 'Ver resultado' : 'Próxima história →'}
              </BotaoComic>
            </div>
          </section>
        )}
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