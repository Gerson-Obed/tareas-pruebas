import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Esta la escribes tú. Hay tres casos y los tres tienen que quedar cubiertos.
//
// El catálogo de la aplicación de ejemplo (lib/catalogo.ts) trae:
//
//   USP-2026   50% de descuento, vigente
//   USP-0001   Q50.00 fijo, vigente
//   USP-1999   25%, VENCIDO el 31 de enero de 2026
//   USP-0404   10%, pero ya se usó sus 2 veces
//
// Para cada caso: qué mensaje aparece, y qué total queda.
// El plan Taller cuesta Q240.00; sin descuento el total es Q268.80.
//
// Consejo: usa page.getByText(...) para el mensaje y page.getByTestId('total')
// para el número. No uses esperas con tiempo fijo: `expect(...).toHaveText()`
// ya reintenta solo hasta que aparece.
// ─────────────────────────────────────────────────────────────────────────────

test.fixme('avisa que el cupón venció y no descuenta nada', async ({ page }) => {
  await page.goto('/checkout');
  // …
});

test.fixme('avisa que el cupón ya se agotó y no descuenta nada', async ({ page }) => {
  await page.goto('/checkout');
  // …
});

test.fixme('avisa que el código no tiene forma de cupón', async ({ page }) => {
  await page.goto('/checkout');
  // …
});
