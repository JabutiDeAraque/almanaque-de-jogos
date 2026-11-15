export default function Modal({ aberto, titulo, mensagem, placar, acoes }) {
  if (!aberto) return null;
  return (
    <div className="modal-comic-fundo aberto" role="dialog" aria-modal="true">
      <div className="card-comic modal-comic">
        <h2 className="titulo-comic ciano">{titulo}</h2>
        <p>{mensagem}</p>
        <p className="placar">{placar}</p>
        <div className="acoes">{acoes}</div>
      </div>
    </div>
  );
}