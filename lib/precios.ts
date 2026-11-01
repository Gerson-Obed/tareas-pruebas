// ─────────────────────────────────────────────────────────────────────────────
// Precios y facturación.
//
// Todo el dinero se maneja en CENTAVOS, siempre entero. Nunca en quetzales con
// decimales: 0.1 + 0.2 !== 0.3 en coma flotante, y una factura con un centavo
// de diferencia es una factura mala.
//
// Este archivo tiene TRES errores sembrados. Las pruebas de pruebas/precios
// los señalan uno por uno. No cambies las pruebas: cambia este archivo.
// ─────────────────────────────────────────────────────────────────────────────

export type Plan = 'libre' | 'equipo' | 'taller';

export const PLANES: Record<Plan, { nombre: string; mensualCentavos: number }> = {
  libre: { nombre: 'Libre', mensualCentavos: 0 },
  equipo: { nombre: 'Equipo', mensualCentavos: 7_500 },
  taller: { nombre: 'Taller', mensualCentavos: 24_000 },
};

/** IVA de Guatemala. */
export const IVA = 0.12;

export type Cupon = {
  codigo: string;
  tipo: 'porcentaje' | 'fijo';
  /** Porcentaje de 0 a 100, o centavos si el tipo es 'fijo'. */
  valor: number;
  /** Descuento máximo en centavos. Opcional. */
  topeCentavos?: number;
  venceEn: Date;
};

export type Desglose = {
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
};

const MS_POR_DIA = 86_400_000;

/**
 * Días completos entre dos fechas. El primer día cuenta, el último no:
 * del 1 de enero al 31 de enero hay 30 días de servicio.
 */
export function diasEntre(desde: Date, hasta: Date): number {
  const ms = hasta.getTime() - desde.getTime();
  if (ms <= 0) return 0;
  return Math.floor(ms / MS_POR_DIA) + 1;
}

/**
 * Cobro proporcional cuando alguien se suscribe a mitad de mes.
 * Se redondea al centavo más cercano.
 */
export function prorratear(plan: Plan, diasUsados: number, diasDelMes: number): number {
  if (diasDelMes <= 0) throw new Error('diasDelMes tiene que ser mayor que cero');
  const mensual = PLANES[plan].mensualCentavos;
  return Math.round((mensual * diasUsados) / diasDelMes);
}

/**
 * Descuenta el cupón de un subtotal. Un cupón vencido no descuenta nada.
 * El resultado nunca puede ser menor que cero: no se le devuelve dinero a
 * nadie por traer un cupón grande.
 */
export function aplicarCupon(subtotal: number, cupon: Cupon, ahora: Date): number {
  if (ahora.getTime() > cupon.venceEn.getTime()) return subtotal;

  const bruto =
    cupon.tipo === 'porcentaje'
      ? Math.round((subtotal * cupon.valor) / 100)
      : cupon.valor;

  const descuento =
    cupon.topeCentavos !== undefined ? Math.min(bruto, cupon.topeCentavos) : bruto;

  return subtotal - descuento;
}

/**
 * El desglose que ve el cliente en la pantalla de pago.
 *
 * El orden importa y es ley fiscal: primero se descuenta el cupón, y el IVA
 * se calcula sobre lo que de verdad se cobra.
 */
export function calcularTotal(subtotal: number, cupon: Cupon | null, ahora: Date): Desglose {
  const iva = Math.round(subtotal * IVA);
  const conIva = subtotal + iva;
  const total = cupon ? aplicarCupon(conIva, cupon, ahora) : conIva;

  return { subtotal, descuento: conIva - total, iva, total };
}

/** Q75.00 a partir de 7500. Solo para mostrar. */
export function enQuetzales(centavos: number): string {
  return `Q${(centavos / 100).toFixed(2)}`;
}
