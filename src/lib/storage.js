const CHAVE_NIVEL = 'flis:nivel';
const CHAVE_TELA_CHEIA = 'flis:telaCheia';

export function salvarNivel(id) {
  try { localStorage.setItem(CHAVE_NIVEL, id); } catch (e) {}
}
export function lerNivelSalvo() {
  try { return localStorage.getItem(CHAVE_NIVEL); } catch (e) { return null; }
}
export function quererTelaCheia(sim) {
  try { localStorage.setItem(CHAVE_TELA_CHEIA, sim ? '1' : '0'); } catch (e) {}
}
export function queroTelaCheia() {
  try { return localStorage.getItem(CHAVE_TELA_CHEIA) === '1'; } catch (e) { return false; }
}