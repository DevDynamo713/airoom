import { test, expect } from '@playwright/test';
test('airoom loads and registers model', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('AIRoom: demo');
  await page.locator('.name-input').fill('gpt-4');
  await page.locator('.type-input').selectOption('llm');
  await page.locator('.provider-input').selectOption('openai');
  await page.locator('.tps-input').fill('100');
  await page.locator('.cost-input').fill('0.0001');
  await page.locator('.add-btn').click();
  await expect(page.locator('.model-list').locator('div').first()).toBeVisible();
});