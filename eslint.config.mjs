// ESLint 9, configuración plana. En Next.js 16 `next lint` ya no existe:
// se corre la CLI de ESLint directamente, con `pnpm lint`.
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'playwright-report/**', 'test-results/**', 'next-env.d.ts']),
]);
