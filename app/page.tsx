import Link from 'next/link';

export default function Inicio() {
  return (
    <main>
      <h1>Tareas Pro</h1>
      <p className="sub">Semana 15 · Calidad y pruebas</p>
      <div className="tarjeta">
        <p>
          La pantalla que vas a probar de extremo a extremo es la de pago.
        </p>
        <p>
          <Link href="/checkout">Ir a la pantalla de pago</Link>
        </p>
      </div>
    </main>
  );
}
