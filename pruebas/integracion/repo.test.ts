import { describe, it, expect } from 'vitest';
import { suscripcionesActivas, canjearCupon, canjesDe, usosDe } from '../../lib/repo';

// Estas pruebas necesitan la base levantada:  docker compose up -d
// Si no está, van a fallar con ECONNREFUSED y eso NO es el error sembrado.

describe('suscripcionesActivas', () => {
  it('devuelve solo las activas del equipo', async () => {
    const filas = await suscripcionesActivas('cafe-luna');

    // cafe-luna tiene tres suscripciones, pero una está cancelada y otra morosa.
    expect(filas).toHaveLength(1);
    expect(filas[0].plan).toBe('equipo');
    expect(filas[0].estado).toBe('activa');
  });

  it('no se lleva las de otro equipo', async () => {
    const filas = await suscripcionesActivas('taller-sur');
    expect(filas).toHaveLength(1);
    expect(filas[0].equipo).toBe('taller-sur');
  });

  it('un equipo que no existe devuelve una lista vacía, no un error', async () => {
    await expect(suscripcionesActivas('no-existe')).resolves.toEqual([]);
  });
});

describe('canjearCupon', () => {
  it('canjea un cupón con cupo disponible', async () => {
    await expect(canjearCupon('USP-2026', 'cafe-luna')).resolves.toBe(true);
    expect(await usosDe('USP-2026')).toBe(1);
    expect(await canjesDe('USP-2026')).toBe(1);
  });

  it('rechaza un cupón que no existe', async () => {
    await expect(canjearCupon('NOP-9999', 'cafe-luna')).resolves.toBe(false);
  });

  it('rechaza un cupón sin cupo', async () => {
    await expect(canjearCupon('USP-0000', 'cafe-luna')).resolves.toBe(false);
    expect(await canjesDe('USP-0000')).toBe(0);
  });

  it('respeta el límite cuando se canjea de a uno', async () => {
    const r = [];
    for (let i = 0; i < 5; i++) r.push(await canjearCupon('USP-2026', `equipo-${i}`));

    expect(r.filter(Boolean)).toHaveLength(3);
    expect(await usosDe('USP-2026')).toBe(3);
  });

  it('respeta el límite cuando llegan diez al mismo tiempo', async () => {
    // Esta es la prueba que importa, y es la razón por la que las pruebas de
    // integración existen. El cupón tiene límite 3. Si diez personas aprietan
    // el botón en el mismo segundo, tienen que pasar exactamente tres.
    //
    // Si esto falla con 10 de 10, el código está leyendo y después
    // escribiendo, y entre la lectura y la escritura se cuelan los demás.
    const resultados = await Promise.all(
      Array.from({ length: 10 }, (_, i) => canjearCupon('USP-2026', `equipo-${i}`)),
    );

    expect(resultados.filter(Boolean)).toHaveLength(3);
    expect(await usosDe('USP-2026')).toBe(3);
    expect(await canjesDe('USP-2026')).toBe(3);
  });
});
