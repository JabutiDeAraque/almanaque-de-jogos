import { ICONES } from '../lib/jogo';

export default function Icone({ nome }) {
  return (
    <svg className="icone-svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="3"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
         dangerouslySetInnerHTML={{ __html: ICONES[nome] || '' }} />
  );
}