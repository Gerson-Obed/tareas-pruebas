import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Dos proyectos: se corren juntos con `pnpm pruebas`, o por separado.
    // Las de integración necesitan la base levantada; las de unidad, nada.
    projects: [
      {
        extends: true,
        test: {
          name: 'unidad',
          include: ['pruebas/unidad/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'integracion',
          include: ['pruebas/integracion/**/*.test.ts'],
          environment: 'node',
          setupFiles: ['pruebas/integracion/preparar.ts'],
          // Comparten una sola base: si corren en paralelo se pisan entre ellas.
          fileParallelism: false,
          testTimeout: 20_000,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/db.ts'],
      reporter: ['text', 'html'],
      // La compuerta. Si baja de aquí, `pnpm cobertura` sale con error.
      thresholds: {
        lines: 85,
        functions: 90,
        branches: 80,
        statements: 85,
      },
    },
  },
});
