import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One local retry: the suite is deterministic in isolation, but running five
  // browser engines at once can starve WebKit on a busy machine. Retries absorb
  // that without hiding a real failure, which fails both attempts.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  // Generous but not unlimited: WebKit in particular is slow under parallel
  // workers, and a real failure should still surface promptly.
  expect: { timeout: 15_000 },
  timeout: 60_000,

  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    // Runs against the production build rather than the dev server. The dev
    // server compiles routes on demand, so first hits were slow enough to make
    // WebKit time out under parallel workers. This also exercises the actual
    // Worker bundle, which is what gets deployed.
    command: "npm run build && npm run preview -- --port 4321",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
