// Se corre antes de CADA archivo de pruebas de integración (setupFiles).
// Deja la base en un estado conocido antes de cada prueba: sin esto, el
// resultado de una prueba depende de cuál corrió antes, y eso es el
// principio del fin.
import { beforeEach, afterAll } from 'vitest';
import { sql } from '../../lib/db';

beforeEach(async () => {
  await sql`TRUNCATE canjes, suscripciones RESTART IDENTITY CASCADE`;
  await sql`DELETE FROM cupones`;

  await sql`
    INSERT INTO cupones (codigo, tipo, valor, vence_en, limite_usos, usos) VALUES
      ('USP-2026', 'porcentaje', 50, '2026-12-31', 3, 0),
      ('USP-0000', 'fijo',     5000, '2026-12-31', 0, 0)
  `;

  await sql`
    INSERT INTO suscripciones (equipo, plan, estado) VALUES
      ('cafe-luna',  'equipo', 'activa'),
      ('cafe-luna',  'taller', 'cancelada'),
      ('cafe-luna',  'equipo', 'morosa'),
      ('taller-sur', 'taller', 'activa')
  `;
});

afterAll(async () => {
  await sql.end();
});
