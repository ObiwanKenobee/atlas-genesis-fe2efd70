import { test, expect, type Route } from "@playwright/test";

/**
 * These tests verify that every failure mode of the newsletter signup
 * surfaces an inline `role="alert"` message inside the banner and never
 * triggers a full-page reload (which historically caused a blank screen).
 *
 * The edge function is stubbed so we can deterministically exercise each
 * branch without needing real captcha/RPC state.
 */

const openBanner = async (page: import("@playwright/test").Page) => {
  await page.goto("/");
  const trigger = page.getByText(/Get weekly insights/i);
  await trigger.waitFor({ state: "visible" });
  await trigger.click();
  await page.getByTestId("newsletter-email").waitFor();
  // The client enforces a 1.5s minimum-interaction gate.
  await page.waitForTimeout(1700);
};

const stubFunction = async (
  page: import("@playwright/test").Page,
  handler: (route: Route) => Promise<void>,
) => {
  await page.route("**/functions/v1/newsletter-subscribe", handler);
};

const tagNavigation = (page: import("@playwright/test").Page) => {
  // If a full navigation happens, this flag flips — we assert it stays true.
  return page.evaluate(() => {
    (window as unknown as { __noReload: boolean }).__noReload = true;
  });
};
const assertNoReload = (page: import("@playwright/test").Page) =>
  page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload === true);

test.describe("Newsletter inline error states", () => {
  test.beforeEach(async ({ context }) => {
    // Clear the per-browser cooldown so each test starts fresh.
    await context.clearCookies();
  });

  test("shows invalid_email error without reload", async ({ page }) => {
    await openBanner(page);
    await tagNavigation(page);
    await page.getByTestId("newsletter-email").fill("not-an-email");
    // Bypass the HTML5 email validator by submitting via JS to reach our handler.
    await page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>('[data-testid="newsletter-email"]');
      if (input) input.type = "text";
    });
    await page.getByTestId("newsletter-submit").click();
    await expect(page.getByTestId("newsletter-error-invalid_email")).toBeVisible();
    expect(await assertNoReload(page)).toBe(true);
  });

  test("shows rate_limited error from server response", async ({ page }) => {
    await stubFunction(page, async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ error: "rate_limited", retry_after_seconds: 42 }),
      });
    });
    await openBanner(page);
    await tagNavigation(page);
    await page.getByTestId("newsletter-email").fill("user@example.com");
    await page.getByTestId("newsletter-submit").click();
    const alert = page.getByTestId("newsletter-error-rate_limited");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/42s/);
    expect(await assertNoReload(page)).toBe(true);
  });

  test("shows captcha_failed error from server response", async ({ page }) => {
    await stubFunction(page, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "captcha_failed", reason: "invalid-input-response" }),
      });
    });
    await openBanner(page);
    await tagNavigation(page);
    await page.getByTestId("newsletter-email").fill("user@example.com");
    await page.getByTestId("newsletter-submit").click();
    await expect(page.getByTestId("newsletter-error-captcha_failed")).toBeVisible();
    expect(await assertNoReload(page)).toBe(true);
  });

  test("shows cooldown_active error from client-side throttle", async ({ page, context }) => {
    // Pre-seed the client cooldown so the very first submit is blocked.
    await context.addInitScript(() => {
      try {
        localStorage.setItem("newsletter:lastAttemptAt", String(Date.now()));
      } catch {
        /* noop */
      }
    });
    await openBanner(page);
    await tagNavigation(page);
    await page.getByTestId("newsletter-email").fill("user@example.com");
    await page.getByTestId("newsletter-submit").click();
    await expect(page.getByTestId("newsletter-error-cooldown_active")).toBeVisible();
    expect(await assertNoReload(page)).toBe(true);
  });
});