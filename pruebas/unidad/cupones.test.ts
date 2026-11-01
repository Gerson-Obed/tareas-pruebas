import { describe, it, expect } from 'vitest';
import { validarCupon, type CuponGuardado } from '../../lib/cupones';

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);
const AHORA = d('2026-10-24');

/** Un cupón de catálogo, con lo que quieras cambiado encima. */
const guardado = (extra: Partial<CuponGuardado> = {}): CuponGuardado => ({
  codigo: 'USP-2026',
  tipo: 'porcentaje',
  valor: 50,
  venceEn: d('2026-12-31'),
  limiteUsos: 100,
  usos: 0,
  ...extra,
});

const CATALOGO = [guardado()];

describe('validarCupon', () => {
  // ── Esta te la regalo, para que veas la forma ──────────────────────────────
  it('acepta un código que existe y está vigente', () => {
    const r = validarCupon('USP-2026', CATALOGO, AHORA);
    expect(r.ok).toBe(true);
  });

  // ── De aquí para abajo te toca a ti ───────────────────────────────────────
  //
  // Escribe las pruebas que hagan falta para que `pnpm mutantes` te dé 6 de 6.
  // Pista: cada mutante rompe UNA regla. Si no tienes una prueba que mire esa
  // regla exacta, el mutante sobrevive.
  //
  // Las seis reglas están en el comentario de arriba de lib/cupones.ts.
  //
  // Un consejo de redacción: el nombre de la prueba debe decir la regla, no
  // la función. «rechaza un código con solo dos letras» sirve;
  // «prueba de validarCupon 3» no le sirve a nadie, ni a ti en tres semanas.

  it.todo('rechaza un código con el formato equivocado');

  it.todo('rechaza un código que no está en el catálogo');

  it.todo('rechaza un cupón vencido');

  it.todo('acepta el cupón el mismo día en que vence');

  it.todo('rechaza un cupón que ya llegó a su límite de usos');

  it.todo('acepta el código aunque venga en minúsculas o con espacios');
});
