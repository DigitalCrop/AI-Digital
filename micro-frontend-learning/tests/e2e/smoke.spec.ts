import { expect, test } from '@playwright/test';
test('loads remotes and shares one session', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in as viewer' }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create order' })).toBeDisabled();
  await page.getByRole('button', { name: 'Log out' }).click();
  await page.goto('/products');
  await expect(page).toHaveURL(/\/login/);
});
