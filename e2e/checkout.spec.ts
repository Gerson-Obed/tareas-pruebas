import { test, expect } from '@playwright/test';

// Esta prueba viene escrita y viene en ROJO. No la cambies: arregla la pantalla.
//
// Un cliente elige el plan Taller (Q240.00) y usa un cupón fijo de Q50.00.
// Lo que tiene que ver en pantalla:
//
//   Subtotal        Q240.00
//   Descuento      −Q50.00
//   IVA (12%)       Q22.80     ← sobre Q190.00, no sobre Q240.00
//   Total a pagar   Q212.80

test('el total que ve el cliente es el total que se le cobra', async ({ page }) => {
  await page.goto('/checkout');

  await page.getByLabel('Plan').selectOption('taller');
  await page.getByLabel('Cupón').fill('USP-0001');
  await page.getByRole('button', { name: 'Calcular' }).click();

  await expect(page.getByTestId('subtotal')).toHaveText('Q240.00');
  await expect(page.getByTestId('descuento')).toHaveText('−Q50.00');
  await expect(page.getByTestId('iva')).toHaveText('Q22.80');
  await expect(page.getByTestId('total')).toHaveText('Q212.80');
});

test('confirmar lleva a la pantalla de gracias con un número de orden', async ({ page }) => {
  await page.goto('/checkout');

  await page.getByLabel('Plan').selectOption('equipo');
  await page.getByRole('button', { name: 'Calcular' }).click();
  await page.getByRole('button', { name: 'Confirmar y pagar' }).click();

  await expect(page).toHaveURL(/\/gracias\?orden=/);
  await expect(page.getByTestId('orden')).not.toBeEmpty();
});
