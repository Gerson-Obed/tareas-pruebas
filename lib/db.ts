import postgres from 'postgres';

/**
 * Una sola conexión para toda la aplicación y para las pruebas de integración.
 * El puerto 5434 es el del docker-compose de este repo.
 */
export const sql = postgres(
  process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5434/pruebas',
  { max: 10 },
);
