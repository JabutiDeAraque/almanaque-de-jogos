import Chip from './Chip';
import BotaoComic from './BotaoComic';
import BotaoTelaCheia from './BotaoTelaCheia';

export default function TopBar({ titulo, nivel, tempo, pontos, vidas, chipsExtras, extra, onMenu }) {
  function recarregar() {
    window.location.reload();
  }

  return (
    <header className="topbar">
      <h1 className="titulo-comic vermelho pequeno">{titulo}</h1>
      <div className="grupo">
        <Chip>{nivel}</Chip>
        <Chip cor="azul">⏱️ <span>{tempo}</span></Chip>
        {pontos !== undefined && <Chip cor="amarelo">⭐ <span>{pontos}</span> pts</Chip>}
        {vidas && <Chip label="Vidas">{vidas}</Chip>}
        {chipsExtras}
        {extra}
        
        <BotaoComic cor="azul" cheio pequeno onClick={recarregar}>
          Reiniciar
        </BotaoComic>
        
        <BotaoTelaCheia />
        <BotaoComic cor="vermelho" cheio pequeno onClick={onMenu}>Menu</BotaoComic>
      </div>
    </header>
  );
}