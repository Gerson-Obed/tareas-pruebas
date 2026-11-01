import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calcularTotal, PLANES, type Cupon } from '@/lib/precios';
import { validarCupon } from '@/lib/cupones';
import { CATALOGO, MENSAJES } from '@/lib/catalogo';

const Entrada = z.object({
  plan: z.enum(['libre', 'equipo', 'taller']),
  codigo: z.string().optional(),
});

export async function POST(req: Request) {
  const cuerpo = await req.json().catch(() => null);
  const parseado = Entrada.safeParse(cuerpo);

  if (!parseado.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const { plan, codigo } = parseado.data;
  const subtotal = PLANES[plan].mensualCentavos;
  const ahora = new Date();

  let cupon: Cupon | null = null;
  let aviso: string | null = null;

  if (codigo && codigo.trim() !== '') {
    const r = validarCupon(codigo, CATALOGO, ahora);
    if (r.ok) {
      cupon = {
        codigo: r.cupon.codigo,
        tipo: r.cupon.tipo,
        valor: r.cupon.valor,
        venceEn: r.cupon.venceEn,
      };
    } else {
      aviso = MENSAJES[r.razon];
    }
  }

  const desglose = calcularTotal(subtotal, cupon, ahora);

  return NextResponse.json({
    desglose,
    aviso,
    orden: `USP-${Date.now().toString(36).toUpperCase()}`,
  });
}
