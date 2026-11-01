// ─────────────────────────────────────────────────────────────────────────────
// Validación de códigos de cupón.
//
// Este archivo NO tiene errores sembrados. Está bien escrito a propósito.
//
// Lo que falta son las PRUEBAS: te toca escribirlas en
// pruebas/unidad/cupones.test.ts. Después, `pnpm mutantes` va a romper este
// archivo de seis maneras distintas y va a exigir que tus pruebas lo noten.
// Una prueba que no se entera de que el código cambió no es una prueba.
// ─────────────────────────────────────────────────────────────────────────────

export type CuponGuardado = {
  codigo: string;
  tipo: 'porcentaje' | 'fijo';
  valor: number;
  venceEn: Date;
  limiteUsos: number;
  usos: number;
};

export type Validacion =
  | { ok: true; cupon: CuponGuardado }
  | { ok: false; razon: 'formato' | 'inexistente' | 'vencido' | 'agotado' };

/** Tres letras, un guion y cuatro dígitos. Por ejemplo: USP-2026. */
const FORMATO = /^[A-Z]{3}-\d{4}$/;

/**
 * Reglas, en este orden:
 *
 * 1. Se limpian los espacios de los extremos y se pasa a mayúsculas, porque
 *    la gente copia y pega y escribe en minúsculas.
 * 2. Si no tiene la forma AAA-0000 → 'formato'.
 * 3. Si no está en el catálogo → 'inexistente'.
 * 4. Si ya pasó su fecha → 'vencido'. El día exacto del vencimiento TODAVÍA
 *    sirve: vence al final de ese día, no al principio.
 * 5. Si ya se usó tantas veces como su límite → 'agotado'.
 */
export function validarCupon(
  codigo: string,
  catalogo: readonly CuponGuardado[],
  ahora: Date,
): Validacion {
  const limpio = codigo.trim().toUpperCase();

  if (!FORMATO.test(limpio)) return { ok: false, razon: 'formato' };

  const cupon = catalogo.find((c) => c.codigo === limpio);
  if (!cupon) return { ok: false, razon: 'inexistente' };

  if (ahora.getTime() > cupon.venceEn.getTime()) return { ok: false, razon: 'vencido' };

  if (cupon.usos >= cupon.limiteUsos) return { ok: false, razon: 'agotado' };

  return { ok: true, cupon };
}
