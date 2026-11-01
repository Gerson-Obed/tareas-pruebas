import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // En CI no se permite `test.only` olvidado, y se reintenta dos veces.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3100',
    // Por defecto Playwright busca data-testid. En este repo los atributos
    // de prueba están en español, así que se lo decimos.
    testIdAttribute: 'data-prueba',
    // La traza solo del primer reintento: es la que de verdad se mira.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Playwright levanta la aplicación solo. No hay que correr `pnpm dev` aparte.
  webServer: {
    command: 'pnpm build && pnpm start --port 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
