type Props = { searchParams: Promise<{ orden?: string }> };

export default async function Gracias({ searchParams }: Props) {
  const { orden } = await searchParams;

  return (
    <main>
      <h1>Listo</h1>
      <p className="sub">Tu pago quedó registrado.</p>
      <div className="tarjeta">
        <p>
          Número de orden: <strong data-prueba="orden">{orden ?? 'sin número'}</strong>
        </p>
      </div>
    </main>
  );
}
