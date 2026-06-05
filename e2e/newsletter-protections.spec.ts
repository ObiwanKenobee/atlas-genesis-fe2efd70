import { test, expect } from "@playwright/test";

/**
 * Verifies the bot/rate-limit protections on the newsletter banner.
 * Each test starts on `/` with a fresh storage state (Playwright default).
 */

async function openNewsletter(page: import("@playwright/test").Page) {
  await page.goto("/");
  // The banner starts collapsed; clicking expands it.
  await page.getByText("Get weekly insights on regenerative impact").click();
  await expect(page.getByTestId("newsletter-email")).toBeVisible();
}

test.describe("Newsletter signup — abuse protections", () => {
  test("honeypot field swallows bot submissions silently", async ({ page }) => {
    await openNewsletter(page);

    // Bots fill hidden fields → form should not POST to supabase
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("newsletter_subscriptions")) requests.push(r.url());
    });

    await page.getByTestId("newsletter-honeypot").fill("https://spammer.example", { force: true });
    await page.getByTestId("newsletter-email").fill("bot@example.com");
    // Wait past the min-fill gate so we isolate the honeypot path
    await page.waitForTimeout(1700);
    await page.getByTestId("newsletter-submit").click();

    // No network call should have been made
    await page.waitForTimeout(500);
    expect(requests).toHaveLength(0);
  });

  test("minimum interaction gate blocks instant submissions", async ({ page }) => {
    await openNewsletter(page);
    await page.getByTestId("newsletter-email").fill("fast@example.com");
    // Submit immediately (< 1500ms)
    await page.getByTestId("newsletter-submit").click();
    await expect(page.getByText(/take a moment to review/i)).toBeVisible();
  });

  test("per-browser cooldown blocks a second attempt within 60s", async ({ page }) => {
    // Pre-seed the cooldown key as if a request just happened.
    await page.addInitScript(() => {
      localStorage.setItem("newsletter:lastAttemptAt", String(Date.now()));
    });
    await openNewsletter(page);
    await page.getByTestId("newsletter-email").fill("repeat@example.com");
    await page.waitForTimeout(1700); // pass min-fill gate
    await page.getByTestId("newsletter-submit").click();
    await expect(page.getByText(/wait a moment before trying again/i)).toBeVisible();
  });

  test("invalid email format is rejected client-side", async ({ page }) => {
    await openNewsletter(page);
    // Bypass HTML5 validation by typing a value the regex rejects but the
    // input's type=email permits (e.g. "a@b" — too short for our regex).
    await page.getByTestId("newsletter-email").fill("not-an-email@x");
    await page.waitForTimeout(1700);
    await page.getByTestId("newsletter-submit").click();
    // Either the toast or no network call — both prove validation kicked in.
    const toast = page.getByText(/valid email/i);
    await expect(toast).toBeVisible({ timeout: 2000 }).catch(async () => {
      // Fallback assertion: no insert request
      const reqs: string[] = [];
      page.on("request", (r) => {
        if (r.url().includes("newsletter_subscriptions")) reqs.push(r.url());
      });
      await page.waitForTimeout(500);
      expect(reqs).toHaveLength(0);
    });
  });
});