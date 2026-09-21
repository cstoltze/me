import { test, expect } from "@playwright/test";

/**
 * These stub /api/chat rather than calling Gemini, so the suite is deterministic
 * and costs nothing. The route's own behaviour is covered by its unit tests.
 */

/** Responds with the AI SDK's UI message stream format. */
async function stubChat(page: import("@playwright/test").Page, reply: string) {
  await page.route("**/api/chat", async (route) => {
    const id = "test-message";
    const chunks = [
      { type: "start" },
      { type: "start-step" },
      { type: "text-start", id },
      { type: "text-delta", id, delta: reply },
      { type: "text-end", id },
      { type: "finish-step" },
      { type: "finish" },
    ];
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body:
        chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") +
        "data: [DONE]\n\n",
    });
  });
}

test.describe("Chat", () => {
  test("shows suggested questions before the first message", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Ask about/ }),
    ).toBeVisible();
  });

  test("sends a typed message and renders the reply", async ({ page }) => {
    await stubChat(page, "He builds backend systems.");
    await page.goto("/");

    await page
      .getByPlaceholder("Ask about my work…")
      .fill("What does Coleman do?");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText("What does Coleman do?")).toBeVisible();
    await expect(page.getByText("He builds backend systems.")).toBeVisible();
  });

  test("sends a suggested question when clicked", async ({ page }) => {
    await stubChat(page, "A reply.");
    await page.goto("/");

    const suggestion = page
      .getByRole("button")
      .filter({ hasText: "?" })
      .first();
    const text = (await suggestion.innerText()).trim();
    await suggestion.click();

    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
    await expect(page.getByText("A reply.")).toBeVisible();
  });

  test("surfaces an error when the endpoint fails", async ({ page }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({ status: 500, body: "boom" }),
    );
    await page.goto("/");

    await page.getByPlaceholder("Ask about my work…").fill("Hello");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("disables sending an empty message", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Send message" }),
    ).toBeDisabled();
  });
});
