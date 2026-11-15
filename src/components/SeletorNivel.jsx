import { NIVEIS, COR_NIVEL } from '../lib/niveis';
import BotaoComic from './BotaoComic';

export default function SeletorNivel({ aberto, aoEscolher, aoVoltar }) {
  if (!aberto) return null;
  return (
    <div className="modal-comic-fundo aberto" role="dialog" aria-modal="true">
      <div className="card-comic modal-comic">
        <h2 className="titulo-comic ciano">Escolha o nível</h2>
        <p>Quanto mais alto, mais difícil!</p>
        <div className="acoes" style={{ flexDirection: 'column', alignItems: 'stretch', marginTop: 18 }}>
          {Object.values(NIVEIS).map(n => (
            <BotaoComic key={n.id} cor={COR_NIVEL[n.id]} cheio onClick={() => aoEscolher(n.id)}>
              {n.icone} {n.rotulo}
            </BotaoComic>
          ))}
        </div>
        <p style={{ marginTop: 22 }}>
          <a href="#/" onClick={(e) => { e.preventDefault(); aoVoltar && aoVoltar(); }}
             style={{ color: 'var(--comic-blue-dark)' }}>
            ← Voltar aos jogos
          </a>
        </p>
      </div>
    </div>
  );
}