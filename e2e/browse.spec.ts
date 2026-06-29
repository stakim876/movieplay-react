import { test, expect } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const hasAuthCreds = Boolean(email && password);

test.describe("authenticated browse", () => {
  test.skip(!hasAuthCreds, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run");

  test("login reaches home and opens movie detail", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("이메일").fill(email!);
    await page.getByPlaceholder("비밀번호").fill(password!);
    await page.getByRole("button", { name: "로그인", exact: true }).click();

    await page.waitForURL(/\/(who|home)/, { timeout: 20_000 });

    if (page.url().includes("/who")) {
      await page.locator(".profile-card").first().click();
      await page.waitForURL(/\/home/, { timeout: 15_000 });
    }

    const firstCard = page.locator(".movie-card-hit-area").first();
    await expect(firstCard).toBeVisible({ timeout: 20_000 });
    await firstCard.click();

    await expect(page).toHaveURL(/\/(movie|tv)\/\d+/, { timeout: 15_000 });
    await expect(page.locator(".movie-detail, .detail-header").first()).toBeVisible();
  });
});
