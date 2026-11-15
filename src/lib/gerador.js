export const CFG = {
  facil:   { ops: ['+', '−'],           soma: 10,  mult: 0,  div: 0,  tipos: ['res', 'res', 'res', 'b', 'op'] },
  medio:   { ops: ['+', '−', '×'],      soma: 30,  mult: 9,  div: 0,  tipos: ['res', 'res', 'b', 'b', 'op'] },
  dificil: { ops: ['+', '−', '×', '÷'], soma: 100, mult: 12, div: 12, tipos: ['res', 'b', 'b', 'op', 'op'] },
  desafio: { ops: ['+', '−', '×', '÷'], soma: 500, mult: 20, div: 20, tipos: ['res', 'b', 'b', 'op', 'op'] },
};
export const TODOS_SINAIS = ['+', '−', '×', '÷'];

function sorteio(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

export function calc(a, op, b) {
  switch (op) { case '+': return a + b; case '−': return a - b; case '×': return a * b; default: return a / b; }
}

function operandos(op, cfg) {
  if (op === '+') { const r = sorteio(2, cfg.soma); const a = sorteio(1, r - 1); return { a, b: r - a, r }; }
  if (op === '−') { const a = sorteio(2, cfg.soma); const b = sorteio(1, a - 1); return { a, b, r: a - b }; }
  if (op === '×') { const a = sorteio(2, cfg.mult), b = sorteio(2, cfg.mult); return { a, b, r: a * b }; }
  const b = sorteio(2, cfg.div), q = sorteio(2, cfg.div); return { a: b * q, b, r: q };
}

export function gerarConta(nivel, vistas) {
  const cfg = CFG[nivel] || CFG.facil;
  for (let tentativa = 0; tentativa < 60; tentativa++) {
    const op = cfg.ops[sorteio(0, cfg.ops.length - 1)];
    const { a, b, r } = operandos(op, cfg);
    const tipo = cfg.tipos[sorteio(0, cfg.tipos.length - 1)];
    let partes, resposta, instrucao;
    if (tipo === 'res') {
      partes = [a, op, b, '=', null]; resposta = String(r); instrucao = 'Qual é o resultado?';
    } else if (tipo === 'b') {
      if (Math.random() < 0.5) { partes = [null, op, b, '=', r]; resposta = String(a); }
      else                     { partes = [a, op, null, '=', r]; resposta = String(b); }
      instrucao = 'Qual número está faltando?';
    } else {
      if (cfg.ops.filter(o => calc(a, o, b) === r).length !== 1) continue;
      partes = [a, null, b, '=', r]; resposta = op; instrucao = 'Qual sinal está faltando?';
    }
    const chave = partes.join('|');
    if (vistas && vistas.has(chave)) continue;
    if (vistas) vistas.add(chave);
    const lacuna = partes.indexOf(null);
    return { partes, lacuna, espera: lacuna === 1 ? 'op' : 'num', resposta, instrucao, chave };
  }
  const { a, b, r } = operandos('+', cfg);
  return { partes: [a, '+', b, '=', null], lacuna: 4, espera: 'num', resposta: String(r), instrucao: 'Qual é o resultado?', chave: 'fallback' };
}