// ─────────────────────────────────────────────────────────────────────────────
// Comprobación final. Corre las seis compuertas en el mismo orden que el CI
// y escribe un comprobante que se pega en la descripción del pull request.
//
//   pnpm verificar            todo, incluido Playwright
//   pnpm verificar --rapido   sin Playwright (útil mientras trabajas)
// ─────────────────────────────────────────────────────────────────────────────
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const rapido = process.argv.includes('--rapido');
const win = process.platform === 'win32';

const correr = (cmd, args) =>
  spawnSync(cmd, args, { stdio: 'inherit', shell: win }).status === 0;

const PASOS = [
  { clave: 'T', nombre: 'Tipos (tsc --noEmit)',        cmd: 'npx', args: ['tsc', '--noEmit'] },
  { clave: 'L', nombre: 'Análisis estático (eslint)',   cmd: 'npx', args: ['eslint', '.'] },
  { clave: 'U', nombre: 'Pruebas de unidad',            cmd: 'npx', args: ['vitest', 'run', '--project', 'unidad'] },
  { clave: 'I', nombre: 'Pruebas de integración',       cmd: 'npx', args: ['vitest', 'run', '--project', 'integracion'] },
  { clave: 'C', nombre: 'Cobertura sobre el umbral',    cmd: 'npx', args: ['vitest', 'run', '--coverage'] },
  { clave: 'M', nombre: 'Caza de mutantes',             cmd: 'node', args: ['scripts/mutantes.mjs'] },
  { clave: 'E', nombre: 'Extremo a extremo (Playwright)', cmd: 'npx', args: ['playwright', 'test'], pesado: true },
];

const resultados = [];

for (const paso of PASOS) {
  if (paso.pesado && rapido) {
    resultados.push({ ...paso, estado: 'omitido' });
    continue;
  }
  console.log(`\n══ ${paso.nombre} ${'═'.repeat(Math.max(0, 54 - paso.nombre.length))}\n`);
  resultados.push({ ...paso, estado: correr(paso.cmd, paso.args) ? 'ok' : 'falla' });
}

// ── El comprobante ───────────────────────────────────────────────────────────
// Incluye el contenido de los dos archivos que escribiste tú, para que el
// comprobante sea tuyo y de nadie más.
const mios = ['pruebas/unidad/cupones.test.ts', 'e2e/cupon-rechazado.spec.ts']
  .map((f) => (existsSync(f) ? readFileSync(f, 'utf8') : ''))
  .join('\n');

const linea = resultados
  .map((r) => `${r.clave}${r.estado === 'ok' ? '+' : r.estado === 'falla' ? '-' : '~'}`)
  .join(' ');

const huella = createHash('sha256').update(linea + mios).digest('hex').slice(0, 12);
const fecha = new Date().toISOString().slice(0, 16).replace('T', ' ');

const icono = { ok: '✓', falla: '✗', omitido: '·' };

console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
console.log('║  COMPROBANTE · Semana 15 · Calidad y pruebas                 ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');
for (const r of resultados) {
  console.log(`   ${icono[r.estado]}  ${r.nombre}`);
}
console.log(`\n   ${linea}   ${huella}   ${fecha} UTC\n`);

const fallas = resultados.filter((r) => r.estado === 'falla').length;
if (fallas > 0) {
  console.log(`   Todavía hay ${fallas} compuerta(s) en rojo. Esa línea de arriba`);
  console.log('   va igual en el pull request: entregar en rojo cuenta más que no\n   entregar.\n');
  process.exit(1);
}

console.log('   Todo en verde. Pega la línea de arriba en la descripción del PR.\n');
