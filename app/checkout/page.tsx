'use client';

// ─────────────────────────────────────────────────────────────────────────────
// La pantalla de pago.
//
// Tiene UN error sembrado, y es de los peores que existen: la aplicación
// cobra bien y muestra mal. Ninguna prueba unitaria lo puede ver, porque el
// cálculo está correcto. Solo lo caza una prueba que abra el navegador y lea
// lo que el cliente lee.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { enQuetzales, PLANES, type Desglose, type Plan } from '@/lib/precios';

export default function Checkout() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>('equipo');
  const [codigo, setCodigo] = useState('');
  const [desglose, setDesglose] = useState<Desglose | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [orden, setOrden] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function calcular(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, codigo }),
      });
      const datos = await r.json();
      setDesglose(datos.desglose);
      setAviso(datos.aviso);
      setOrden(datos.orden);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main>
      <h1>Pagar</h1>
      <p className="sub">Elige tu plan y, si tienes cupón, úsalo.</p>

      <form className="tarjeta" onSubmit={calcular}>
        <label htmlFor="plan">Plan</label>
        <select id="plan" value={plan} onChange={(e) => setPlan(e.target.value as Plan)}>
          {(Object.keys(PLANES) as Plan[]).map((p) => (
            <option key={p} value={p}>
              {PLANES[p].nombre} — {enQuetzales(PLANES[p].mensualCentavos)} al mes
            </option>
          ))}
        </select>

        <label htmlFor="cupon">Cupón</label>
        <input
          id="cupon"
          value={codigo}
          placeholder="AAA-0000"
          onChange={(e) => setCodigo(e.target.value)}
        />

        <button type="submit" disabled={enviando}>
          {enviando ? 'Calculando…' : 'Calcular'}
        </button>

        {aviso && <p className="aviso">{aviso}</p>}

        {desglose && (
          <>
            <dl>
              <dt>Subtotal</dt>
              <dd data-prueba="subtotal">{enQuetzales(desglose.subtotal)}</dd>

              <dt>Descuento</dt>
              <dd data-prueba="descuento">−{enQuetzales(desglose.descuento)}</dd>

              <dt>IVA (12%)</dt>
              <dd data-prueba="iva">{enQuetzales(desglose.iva)}</dd>

              <div className="total" style={{ display: 'contents' }}>
                <dt>Total a pagar</dt>
                <dd data-prueba="total">{enQuetzales(desglose.subtotal + desglose.iva)}</dd>
              </div>
            </dl>

            <button
              type="button"
              disabled={enviando}
              onClick={() => router.push(`/gracias?orden=${orden}`)}
            >
              Confirmar y pagar
            </button>
          </>
        )}
      </form>
    </main>
  );
}
