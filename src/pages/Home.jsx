import { useEffect } from 'react';
import { aplicarIconesLegado } from '../lib/jogo';

const JOGOS = [
  {
    slug: 'forca',
    pasta: '#/jogo/forca',
    nome: 'Forca Maluca',
    icone: '🔤',
    imagem: 'assets/forca.png',
    pronto: true,
    desc: 'Descubra a palavra antes que o personagem se complete!',
  },
  {
    slug: 'calculadora',
    pasta: '#/jogo/calculadora',
    nome: 'Calculadora Quebrada!',
    icone: '🧮',
    imagem: 'assets/calculadora.png',
    pronto: true,
    desc: 'Algumas teclas quebraram. Chegue ao número certo com as que sobraram!',
  },
  {
    slug: 'corrida',
    pasta: '#/jogo/corrida',
    nome: 'Corrida da Mente',
    icone: '🏁',
    imagem: 'assets/corrida.png',
    pronto: true,
    desc: 'Acerte rápido e ganhe a corrida. Dá pra jogar em dupla!',
  },
  {
    slug: 'quiz',
    pasta: '#/jogo/quiz',
    nome: 'Quiz Comic',
    icone: '💬',
    imagem: 'assets/quiz.png',
    pronto: true,
    desc: 'Responda às perguntas sobre livros, escola e muito mais. Cuidado com as vidas!',
  },
  {
    slug: 'historia',
    pasta: '#/jogo/historia',
    nome: 'Ordene a História',
    icone: '📖',
    imagem: 'assets/historia.png',
    pronto: true,
    desc: 'Coloque as cenas na ordem certa e monte a história.',
  },
];

export default function Home() {
  useEffect(() => { aplicarIconesLegado(); }, []);

  return (
    <main className="home-main">
      <header className="capa">
        <h1 className="titulo-comic ciano">ALMANAQUE DE JOGOS</h1>
        <div className="titulo-comic branco sub">Escolha um e bora brincar!</div>
      </header>

      <section className="cards" aria-label="Jogos">
        {JOGOS.map(j => {
          const Tag = j.pronto ? 'a' : 'div';
          const props = j.pronto
            ? { href: j.pasta, className: 'jogo-card' }
            : { className: 'jogo-card em-breve' };

          return (
            <Tag key={j.slug} {...props}>
              <div className="jogo-img">
                {j.imagem ? (
                  <img src={j.imagem} alt="" />
                ) : (
                  <span className="provisorio" aria-hidden="true">{j.icone}</span>
                )}
              </div>
              <h2 className="titulo-comic branco">{j.nome}</h2>
              <p>{j.desc}</p>
              <span className="btn-comic amarelo cheio">
                {j.pronto ? 'JOGAR' : 'EM BREVE'}
              </span>
            </Tag>
          );
        })}
      </section>
    </main>
  );
}