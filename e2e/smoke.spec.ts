import { expect, test } from '@playwright/test'

test('home renders without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(errors).toEqual([])
})

test('skip link moves focus to main', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused()
})
