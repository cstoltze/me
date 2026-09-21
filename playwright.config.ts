import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
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
    // `--ignore-lock` keeps the dev server in the foreground. Astro 7 detects
    // when it is run by an AI coding agent and backgrounds itself, which makes
    // Playwright think the server exited immediately.
    command: "npm run dev -- --ignore-lock",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    // Astro's first dev start has to sync content and generate types.
    timeout: 120_000,
  },
});
