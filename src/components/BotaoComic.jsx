import Icone from './Icone';

export default function BotaoComic({
  cor, cheio, pequeno, children, icone, onClick, disabled, href, type = 'button'
}) {
  const classes = [
    'btn-comic',
    cor || '',
    cheio ? 'cheio' : '',
    pequeno ? 'pequeno' : '',
  ].filter(Boolean).join(' ');

  const conteudo = (
    <div className="btn-comic-conteudo">
      {icone && <Icone nome={icone} />}
      {children}
    </div>
  );

  if (href) return <a className={classes} href={href}>{conteudo}</a>;
  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {conteudo}
    </button>
  );
}