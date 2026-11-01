// ─────────────────────────────────────────────────────────────────────────────
// Acceso a datos.
//
// Este archivo tiene DOS errores sembrados, y ninguno de los dos se ve
// leyendo el código con calma: los dos necesitan una base de datos de verdad
// para salir a la luz. Por eso existen las pruebas de integración.
// ─────────────────────────────────────────────────────────────────────────────
import { sql } from './db';
import type { Plan } from './precios';

export type Suscripcion = {
  id: number;
  equipo: string;
  plan: Plan;
  estado: 'activa' | 'cancelada' | 'morosa';
};

/**
 * Las suscripciones que ese equipo tiene AL DÍA.
 * Una suscripción cancelada o morosa no da acceso a nada.
 */
export async function suscripcionesActivas(equipo: string): Promise<Suscripcion[]> {
  const filas = await sql<Suscripcion[]>`
    SELECT id, equipo, plan, estado
      FROM suscripciones
     WHERE equipo = ${equipo}
       AND estado = 'activa'
     ORDER BY id
  `;
  return filas;
}

/**
 * Canjea un cupón para un equipo.
 *
 * Devuelve true si el canje se hizo, false si el cupón no existe o ya llegó
 * a su límite de usos. Un cupón con límite 3 no se puede canjear 4 veces,
 * **ni aunque los 4 intentos lleguen en el mismo milisegundo**.
 */
export async function canjearCupon(codigo: string, equipo: string): Promise<boolean> {
  // Leer y escribir en un solo UPDATE condicional: la base bloquea la fila,
  // así que diez canjes simultáneos se ponen en fila y solo pasan los que caben.
  return sql.begin(async (tx) => {
    const filas = await tx`
      UPDATE cupones SET usos = usos + 1
       WHERE codigo = ${codigo} AND usos < limite_usos
      RETURNING codigo
    `;
    if (filas.length === 0) return false;

    await tx`INSERT INTO canjes (codigo, equipo) VALUES (${codigo}, ${equipo})`;
    return true;
  });
}

/** Cuántas veces se ha canjeado un cupón, según la tabla de canjes. */
export async function canjesDe(codigo: string): Promise<number> {
  const filas = await sql<{ n: string }[]>`
    SELECT count(*)::text AS n FROM canjes WHERE codigo = ${codigo}
  `;
  return Number(filas[0].n);
}

/** Los usos que tiene anotados el propio cupón. */
export async function usosDe(codigo: string): Promise<number> {
  const filas = await sql<{ usos: number }[]>`
    SELECT usos FROM cupones WHERE codigo = ${codigo}
  `;
  return filas[0].usos;
}
