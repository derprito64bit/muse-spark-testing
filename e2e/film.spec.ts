import { expect, test } from '@playwright/test'

test('film runway renders chapters without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/')
  const runway = page.getByTestId('film-runway')
  await expect(runway).toBeVisible()
  await expect(page.getByTestId('film-chapter')).toBeVisible()
  await expect(page.getByTestId('film-chapter')).toHaveAttribute('data-act', 'arrival')
  expect(errors).toEqual([])
})

test('film ?t= deep link jumps to the teardown act', async ({ page }) => {
  await page.goto('/?t=0.4')
  const chapter = page.getByTestId('film-chapter')
  await expect(chapter).toBeVisible()
  await expect(chapter).toHaveAttribute('data-act', 'teardown', { timeout: 15000 })
})

test('film static fallback renders every act without WebGL', async ({ page }) => {
  await page.goto('/?nogl=1')
  const fallback = page.getByTestId('film-fallback')
  await expect(fallback).toBeVisible()
  await expect(fallback.getByRole('heading', { level: 2 }).first()).toBeVisible()
})
