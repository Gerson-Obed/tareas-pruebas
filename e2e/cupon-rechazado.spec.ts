import { test, expect, type Page } from '@playwright/test';

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

async function calcularConCupon(page: Page, codigo: string) {
  await page.goto('/checkout');
  await page.getByLabel('Plan').selectOption('taller');
  await page.getByLabel('Cupón').fill(codigo);
  await page.getByRole('button', { name: 'Calcular' }).click();
}

test('avisa que el cupón venció y no descuenta nada', async ({ page }) => {
  await calcularConCupon(page, 'USP-1999');

  await expect(page.getByText('Ese cupón ya venció.')).toBeVisible();
  await expect(page.getByTestId('descuento')).toHaveText('−Q0.00');
  await expect(page.getByTestId('total')).toHaveText('Q268.80');
});

test('avisa que el cupón ya se agotó y no descuenta nada', async ({ page }) => {
  await calcularConCupon(page, 'USP-0404');

  await expect(
    page.getByText('Ese cupón ya se usó todas las veces que podía usarse.'),
  ).toBeVisible();
  await expect(page.getByTestId('descuento')).toHaveText('−Q0.00');
  await expect(page.getByTestId('total')).toHaveText('Q268.80');
});

test('avisa que el código no tiene forma de cupón', async ({ page }) => {
  await calcularConCupon(page, 'HOLA');

  await expect(
    page.getByText('Ese código no tiene la forma de un cupón (AAA-0000).'),
  ).toBeVisible();
  await expect(page.getByTestId('descuento')).toHaveText('−Q0.00');
  await expect(page.getByTestId('total')).toHaveText('Q268.80');
});
