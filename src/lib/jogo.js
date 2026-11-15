let _ctx = null;

export function tocarSom(tipo) {
  try {
    _ctx = _ctx || new (window.AudioContext || window.webkitAudioContext)();
    const notas = { acerto: [660, 880], erro: [220, 160], vitoria: [523, 659, 784, 1047] }[tipo] || [440];
    notas.forEach((f, i) => {
      const o = _ctx.createOscillator(), g = _ctx.createGain();
      o.frequency.value = f; o.type = 'square';
      g.gain.setValueAtTime(0.08, _ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + i * 0.12 + 0.11);
      o.connect(g); g.connect(_ctx.destination);
      o.start(_ctx.currentTime + i * 0.12); o.stop(_ctx.currentTime + i * 0.12 + 0.12);
    });
  } catch (e) {}
}

export const ICONES = {
  casa: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  recarregar: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
};

export function telaCheiaAtiva() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function entrarTelaCheia() {
  const d = document.documentElement;
  const pedir = d.requestFullscreen || d.webkitRequestFullscreen;
  if (!pedir) return Promise.reject(new Error('sem suporte'));
  try { return Promise.resolve(pedir.call(d)); } catch (e) { return Promise.reject(e); }
}

export function alternarTelaCheia(quererFn) {
  if (telaCheiaAtiva()) {
    quererFn(false);
    const sair = document.exitFullscreen || document.webkitExitFullscreen;
    if (sair) sair.call(document);
  } else {
    quererFn(true);
    entrarTelaCheia().catch(() => {});
  }
}

// (cole no final do src/lib/jogo.js)
export function aplicarIconesLegado() {
  document.querySelectorAll('[data-icone]').forEach(el => {
    if (!el.querySelector('.icone-svg')) {
      const nome = el.dataset.icone;
      const svg = `<svg class="icone-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nome] || ''}</svg>`;
      el.insertAdjacentHTML('afterbegin', svg);
    }
  });
}