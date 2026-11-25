// node test.js — contrastes WCAG de cada paleta según los roles que usa el reproductor.
global.window = {}; require('./ep.js');
const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
// [descripción, color A, color B, mínimo]
const reglas = p => [
  ['texto sobre fondo', p.texto, p.fondo, 7],
  ['realce (precios, títulos de lista) sobre fondo', p.realce, p.fondo, 4.5],
  ['letra blanca sobre primario (barra, bloque de precio)', '#ffffff', p.primario, 4.5],
  ['acento (precio grande) sobre primario', p.acento, p.primario, 3],
  ['letra oscura sobre acento (etiquetas)', '#1a1a1a', p.acento, 4.5],
  ['acento sobre degradé negro de foto (precio en foto)', p.acento, '#2a2a2a', 4.5]
];
let mal = 0;
window.EP.PALETAS.forEach(p => reglas(p).forEach(([d, a, b, min]) => {
  const r = cr(a, b);
  if (r < min) { mal++; console.log(`FALLA ${p.id}: ${d} = ${r.toFixed(2)} (mín ${min})`); }
}));
console.log(mal ? mal + ' fallas' : 'OK: ' + window.EP.PALETAS.length + ' paletas cumplen');
process.exit(mal ? 1 : 0);
