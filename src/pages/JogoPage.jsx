import Quiz from '../jogos/Quiz/Quiz';
import Calculadora from '../jogos/Calculadora/Calculadora';
import Corrida from '../jogos/Corrida/Corrida';
import Forca from '../jogos/Forca/Forca';
import Historia from '../jogos/Historia/Historia';
import { NIVEIS } from '../lib/niveis';

const JOGOS = {
  quiz: Quiz,
  calculadora: Calculadora,
  corrida: Corrida,
  forca: Forca,
  historia: Historia,
};

export default function JogoPage({ id, params }) {
  const Componente = JOGOS[id];
  if (!Componente) {
    return (
      <main style={{ padding: 40, textAlign: 'center' }}>
        <h1 className="titulo-comic ciano">Jogo não encontrado</h1>
        <p><a href="#/" style={{ color: 'var(--comic-cyan)' }}>← Voltar ao início</a></p>
      </main>
    );
  }

  const nivelParam = params.get('nivel');
  const nivelInicial = NIVEIS[nivelParam] ? nivelParam : null;

  const aoSair = () => { window.location.hash = '/'; };

  return <Componente nivelInicial={nivelInicial} aoSair={aoSair} />;
}