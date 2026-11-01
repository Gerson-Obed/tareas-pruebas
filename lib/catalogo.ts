import type { CuponGuardado } from './cupones';

/**
 * Catálogo de cupones de la aplicación de ejemplo.
 * En el producto real esto vive en la base; aquí está en memoria a propósito,
 * para que las pruebas de extremo a extremo no dependan de Docker.
 */
export const CATALOGO: readonly CuponGuardado[] = [
  {
    codigo: 'USP-2026',
    tipo: 'porcentaje',
    valor: 50,
    venceEn: new Date('2026-12-31T23:59:59Z'),
    limiteUsos: 100,
    usos: 0,
  },
  {
    codigo: 'USP-0001',
    tipo: 'fijo',
    valor: 5_000,
    venceEn: new Date('2026-12-31T23:59:59Z'),
    limiteUsos: 100,
    usos: 0,
  },
  {
    codigo: 'USP-1999',
    tipo: 'porcentaje',
    valor: 25,
    venceEn: new Date('2026-01-31T23:59:59Z'),
    limiteUsos: 100,
    usos: 0,
  },
  {
    codigo: 'USP-0404',
    tipo: 'porcentaje',
    valor: 10,
    venceEn: new Date('2026-12-31T23:59:59Z'),
    limiteUsos: 2,
    usos: 2,
  },
];

export const MENSAJES: Record<string, string> = {
  formato: 'Ese código no tiene la forma de un cupón (AAA-0000).',
  inexistente: 'Ese cupón no existe.',
  vencido: 'Ese cupón ya venció.',
  agotado: 'Ese cupón ya se usó todas las veces que podía usarse.',
};
