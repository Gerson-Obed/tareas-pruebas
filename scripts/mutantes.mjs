// ─────────────────────────────────────────────────────────────────────────────
// Caza de mutantes para lib/cupones.ts
//
// Idea: si tus pruebas son de verdad, romper el código a propósito debería
// ponerlas en rojo. Este script rompe lib/cupones.ts de seis maneras, corre
// TUS pruebas después de cada una, y exige que fallen.
//
// Un mutante "sobrevive" cuando las pruebas siguen en verde con el código
// roto. Eso significa que esa regla no la está mirando nadie.
//
// No necesita ninguna dependencia: el original se guarda y se restaura
// siempre, incluso si cortas con Ctrl-C.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const ARCHIVO = new URL('../lib/cupones.ts', import.meta.url);
const PRUEBAS = 'pruebas/unidad/cupones.test.ts';

const MUTANTES = [
  {
    nombre: 'El formato acepta dos letras en vez de tres',
    de: '/^[A-Z]{3}-\\d{4}$/',
    a: '/^[A-Z]{2,3}-\\d{4}$/',
  },
  {
    nombre: 'El formato acepta cualquier cantidad de dígitos',
    de: '/^[A-Z]{3}-\\d{4}$/',
    a: '/^[A-Z]{3}-\\d+$/',
  },
  {
    nombre: 'El cupón vence un día antes (> pasa a >=)',
    de: 'if (ahora.getTime() > cupon.venceEn.getTime())',
    a: 'if (ahora.getTime() >= cupon.venceEn.getTime())',
  },
  {
    nombre: 'Permite un uso de más (>= pasa a >)',
    de: 'if (cupon.usos >= cupon.limiteUsos)',
    a: 'if (cupon.usos > cupon.limiteUsos)',
  },
  {
    nombre: 'Deja de aceptar minúsculas',
    de: 'const limpio = codigo.trim().toUpperCase();',
    a: 'const limpio = codigo.trim();',
  },
  {
    nombre: 'Deja de limpiar los espacios',
    de: 'const limpio = codigo.trim().toUpperCase();',
    a: 'const limpio = codigo.toUpperCase();',
  },
];

const original = readFileSync(ARCHIVO, 'utf8');
let restaurado = false;
const restaurar = () => {
  if (!restaurado) {
    writeFileSync(ARCHIVO, original);
    restaurado = true;
  }
};
process.on('exit', restaurar);
process.on('SIGINT', () => { restaurar(); process.exit(130); });

const correrPruebas = () =>
  spawnSync('npx', ['vitest', 'run', '--project', 'unidad', PRUEBAS], {
    stdio: 'pipe',
    encoding: 'utf8',
    // En Windows, npx es un .cmd y spawn necesita el shell para encontrarlo.
    shell: process.platform === 'win32',
  }).status === 0;

console.log('\n  Cazando mutantes en lib/cupones.ts\n');

// Primero: con el código intacto tus pruebas tienen que estar en VERDE.
// Si no, lo que falla es tu suite, no el código, y no tiene sentido seguir.
if (!correrPruebas()) {
  console.log('  Tus pruebas fallan con el código ORIGINAL, que está bien escrito.');
  console.log('  Arregla primero tu suite y vuelve a correr `pnpm mutantes`.\n');
  process.exit(1);
}

let cazados = 0;
const sobrevivientes = [];

for (const [i, m] of MUTANTES.entries()) {
  if (!original.includes(m.de)) {
    console.log(`  ${i + 1}. ⚠  no pude sembrar este mutante — ¿moviste código de lib/cupones.ts?`);
    sobrevivientes.push(m.nombre);
    continue;
  }
  writeFileSync(ARCHIVO, original.replace(m.de, m.a));
  const verde = correrPruebas();
  writeFileSync(ARCHIVO, original);

  if (verde) {
    console.log(`  ${i + 1}. SOBREVIVE   ${m.nombre}`);
    sobrevivientes.push(m.nombre);
  } else {
    console.log(`  ${i + 1}. cazado      ${m.nombre}`);
    cazados++;
  }
}

restaurar();

console.log(`\n  ${cazados} de ${MUTANTES.length} mutantes cazados.\n`);

if (sobrevivientes.length > 0) {
  console.log('  Te falta una prueba para cada uno de estos:');
  for (const s of sobrevivientes) console.log(`    · ${s}`);
  console.log('');
  process.exit(1);
}

console.log('  Tu suite es de verdad. Ninguna de las seis reglas quedó sin vigilancia.\n');
