import { test, expect } from "@playwright/test";

test.describe("auth routes", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
    await expect(page.getByPlaceholder("이메일")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인", exact: true })).toBeVisible();
  });

  test("signup page is reachable from login", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "회원가입" }).click();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("protected home redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
  });
});
