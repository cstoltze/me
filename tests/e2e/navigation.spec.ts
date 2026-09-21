import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("reaches the resume from the landing page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Experience" }).click();
    await expect(page).toHaveURL(/\/resume\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Coleman Stoltze",
    );
  });

  test("returns to the landing page from the resume", async ({ page }) => {
    await page.goto("/resume");
    await page.getByRole("link", { name: "Back" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("lists every experience entry on the resume, newest first", async ({
    page,
  }) => {
    await page.goto("/resume");
    const roles = page.locator("main h3");
    await expect(roles.first()).toBeVisible();
    // The most recent role is the one still in progress.
    await expect(roles.first()).toHaveText("Founding Engineer");
  });
});
