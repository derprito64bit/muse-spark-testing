import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'cmd /c node_modules\\.bin\\vite preview --port 4173 --strictPort --host 127.0.0.1',
    port: 4173,
    // Never reuse: a stale preview of the previous dist causes nondeterministic
    // failures. Always boot the current build. CI already behaves this way.
    reuseExistingServer: false,
  },
})
