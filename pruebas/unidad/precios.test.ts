import { describe, it, expect } from 'vitest';
import {
  diasEntre,
  prorratear,
  aplicarCupon,
  calcularTotal,
  enQuetzales,
  type Cupon,
} from '../../lib/precios';

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);

const AHORA = d('2026-10-24');

const cupon = (extra: Partial<Cupon> = {}): Cupon => ({
  codigo: 'USP-2026',
  tipo: 'porcentaje',
  valor: 50,
  venceEn: d('2026-12-31'),
  ...extra,
});

// ─────────────────────────────────────────────────────────────────────────────
describe('diasEntre', () => {
  it('cuenta el primer día y no cuenta el último', () => {
    // Del 1 al 31 de enero hay 30 días de servicio, no 31.
    expect(diasEntre(d('2026-01-01'), d('2026-01-31'))).toBe(30);
  });

  it('cuenta bien cuando el rango cruza de mes', () => {
    expect(diasEntre(d('2026-01-15'), d('2026-02-01'))).toBe(17);
  });

  it('devuelve cero si las dos fechas son la misma', () => {
    expect(diasEntre(d('2026-03-10'), d('2026-03-10'))).toBe(0);
  });

  it('devuelve cero si la fecha final es anterior', () => {
    expect(diasEntre(d('2026-03-10'), d('2026-03-01'))).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('prorratear', () => {
  it('cobra la parte del mes que se usó', () => {
    expect(prorratear('equipo', 10, 30)).toBe(2_500);
  });

  it('redondea al centavo más cercano', () => {
    // 24000 * 17 / 31 = 13161.29…
    expect(prorratear('taller', 17, 31)).toBe(13_161);
  });

  it('el plan libre no cobra nada', () => {
    expect(prorratear('libre', 15, 30)).toBe(0);
  });

  it('un mes de cero días es un error del que llama, no un NaN', () => {
    expect(() => prorratear('equipo', 10, 0)).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('aplicarCupon', () => {
  it('descuenta el porcentaje', () => {
    expect(aplicarCupon(24_000, cupon({ valor: 50 }), AHORA)).toBe(12_000);
  });

  it('descuenta el monto fijo', () => {
    expect(aplicarCupon(24_000, cupon({ tipo: 'fijo', valor: 5_000 }), AHORA)).toBe(19_000);
  });

  it('respeta el tope del descuento', () => {
    // 50% de 24000 son 12000, pero el cupón no puede descontar más de 5000.
    expect(aplicarCupon(24_000, cupon({ valor: 50, topeCentavos: 5_000 }), AHORA)).toBe(19_000);
  });

  it('un cupón vencido no descuenta nada', () => {
    expect(aplicarCupon(24_000, cupon({ venceEn: d('2026-01-01') }), AHORA)).toBe(24_000);
  });

  it('el día del vencimiento todavía sirve', () => {
    expect(aplicarCupon(24_000, cupon({ venceEn: AHORA }), AHORA)).toBe(12_000);
  });

  it('nunca deja el cobro en negativo', () => {
    // Un cupón de Q80 sobre una factura de Q50 deja la factura en cero.
    // No le devolvemos Q30 a nadie por traer un papelito.
    expect(aplicarCupon(5_000, cupon({ tipo: 'fijo', valor: 8_000 }), AHORA)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('calcularTotal', () => {
  it('sin cupón, suma el IVA al subtotal', () => {
    expect(calcularTotal(7_500, null, AHORA)).toEqual({
      subtotal: 7_500,
      descuento: 0,
      iva: 900,
      total: 8_400,
    });
  });

  it('con cupón de porcentaje, el total cuadra', () => {
    // OJO: esta prueba pasa aunque el IVA se calcule en el orden equivocado,
    // porque un porcentaje conmuta con otro porcentaje. Mirar solo el total
    // no alcanza. La siguiente prueba es la que de verdad sirve.
    expect(calcularTotal(24_000, cupon({ valor: 50 }), AHORA).total).toBe(13_440);
  });

  it('con cupón de porcentaje, el desglose completo cuadra', () => {
    expect(calcularTotal(24_000, cupon({ valor: 50 }), AHORA)).toEqual({
      subtotal: 24_000,
      descuento: 12_000,
      iva: 1_440,
      total: 13_440,
    });
  });

  it('el IVA se calcula sobre lo que de verdad se cobra', () => {
    // Q240 menos un cupón fijo de Q50 son Q190. El IVA es sobre Q190,
    // no sobre Q240. Es la diferencia entre facturar bien y facturar mal.
    expect(calcularTotal(24_000, cupon({ tipo: 'fijo', valor: 5_000 }), AHORA)).toEqual({
      subtotal: 24_000,
      descuento: 5_000,
      iva: 2_280,
      total: 21_280,
    });
  });

  it('un cupón vencido no cambia nada', () => {
    expect(calcularTotal(24_000, cupon({ venceEn: d('2026-01-01') }), AHORA)).toEqual({
      subtotal: 24_000,
      descuento: 0,
      iva: 2_880,
      total: 26_880,
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('enQuetzales', () => {
  it('formatea centavos con dos decimales', () => {
    expect(enQuetzales(7_500)).toBe('Q75.00');
    expect(enQuetzales(0)).toBe('Q0.00');
    expect(enQuetzales(13_161)).toBe('Q131.61');
  });
});
