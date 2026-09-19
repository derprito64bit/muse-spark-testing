import { expect, test } from '@playwright/test'

test('3D phone mounts without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/')
  const viewers = page.getByTestId('phone-viewer')
  await expect(viewers.first()).toBeVisible()
  await viewers.first().scrollIntoViewIfNeeded()
  await expect(page.getByTestId('phone-canvas').first()).toBeVisible({ timeout: 20000 })
  expect(errors).toEqual([])
})

test('static fallback renders with WebGL forced off', async ({ page }) => {
  await page.goto('/?nogl=1')
  const viewers = page.getByTestId('phone-viewer')
  await expect(viewers.first()).toBeVisible()
  await expect(viewers.first()).toHaveAttribute('data-fallback', 'true')
  await expect(viewers.first().getByRole('img').first()).toBeVisible()
})
