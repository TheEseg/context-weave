import { devices, expect, test } from "@playwright/test";

const iPhone13 = devices["iPhone 13"];

test.describe("ContextWeave demo desktop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads the main app shell", async ({ page }) => {
    await expect(page.getByTestId("chat-panel")).toBeVisible();
    await expect(page.getByTestId("context-inspector")).toBeVisible();
    await expect(page.getByLabel("Session ID")).toBeVisible();
    await expect(page.getByLabel("User ID")).toBeVisible();
    await expect(page.getByTestId("memory-toggle")).toBeVisible();
    await expect(page.getByTestId("memory-on")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("load-demo-session")).toBeVisible();
    await expect(page.getByTestId("open-session")).toBeVisible();
    await expect(page.getByTestId("reset-session")).toBeVisible();
  });

  test("loads the demo session with populated context", async ({ page }) => {
    await page.getByTestId("load-demo-session").click();

    await expect(page.getByTestId("chat-panel").getByText("What architecture did we decide for ContextWeave?")).toBeVisible();
    await expect(page.getByTestId("inspector-tab-memory")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("summary-section")).toContainText("FastAPI");
    await expect(page.getByTestId("facts-section")).toContainText("GitHub Pages");
    await expect(page.getByTestId("chunks-section")).toContainText("Railway");

    await page.getByTestId("inspector-tab-diff").click();
    await expect(page.getByTestId("context-diff-section")).toContainText("These context elements changed since the previous turn.");
  });

  test("sends a new message and keeps the inspector populated", async ({ page }) => {
    await page.getByTestId("load-demo-session").click();
    await page.getByTestId("message-input").fill("Please remember that the architecture also includes FastAPI.");
    await page.getByTestId("send-message").click();

    await expect(
      page.getByTestId("chat-panel").getByText("Please remember that the architecture also includes FastAPI."),
    ).toBeVisible();
    await expect(page.getByTestId("message-assistant").last()).toContainText(/FastAPI|remembered context|Grounded mock response/);
    await expect(page.getByTestId("inspector-tab-memory")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("facts-section")).toContainText("FastAPI");
    await expect(page.getByTestId("summary-section")).not.toBeEmpty();
  });

  test("keeps chat working when memory is turned off", async ({ page }) => {
    await page.getByTestId("memory-off").click();
    await expect(page.getByTestId("memory-off")).toHaveAttribute("aria-pressed", "true");

    await page.getByTestId("message-input").fill("What architecture did we decide?");
    await page.getByTestId("send-message").click();

    await expect(page.getByTestId("message-assistant").last()).toContainText("Memory is off");
    await expect(page.getByTestId("summary-section")).toContainText("Disabled for this turn");
    await expect(page.getByTestId("facts-section")).toContainText("Persistent facts were not pulled");
    await page.getByTestId("inspector-tab-prompt").click();
    await expect(page.getByTestId("packed-context-section")).toContainText("Current user message:");
  });
});

test.describe("ContextWeave demo mobile", () => {
  test.use({
    viewport: iPhone13.viewport,
    userAgent: iPhone13.userAgent,
    deviceScaleFactor: iPhone13.deviceScaleFactor,
    isMobile: iPhone13.isMobile,
    hasTouch: iPhone13.hasTouch,
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads cleanly on a narrow viewport", async ({ page }) => {
    await expect(page.getByTestId("chat-panel")).toBeVisible();
    await expect(page.getByTestId("message-input")).toBeVisible();
    await expect(page.getByTestId("load-demo-session")).toBeVisible();
    await expect(page.getByTestId("memory-toggle")).toBeVisible();

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasOverflow).toBeFalsy();

    await page.getByTestId("context-inspector").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("context-inspector")).toBeVisible();
  });

  test("keeps the loaded demo state readable on mobile", async ({ page }) => {
    await page.getByTestId("load-demo-session").click();

    await expect(page.getByTestId("chat-panel").getByText("What architecture did we decide for ContextWeave?")).toBeVisible();
    await page.getByTestId("context-inspector").scrollIntoViewIfNeeded();

    await expect(page.getByTestId("summary-section")).toBeVisible();
    await expect(page.getByTestId("facts-section")).toBeVisible();
    await expect(page.getByTestId("chunks-section")).toBeVisible();
    await page.getByTestId("inspector-tab-prompt").click();
    await expect(page.getByTestId("packed-context-section")).toBeVisible();

    const loadDemoBox = await page.getByTestId("load-demo-session").boundingBox();
    const openSessionBox = await page.getByTestId("open-session").boundingBox();
    expect(loadDemoBox).not.toBeNull();
    expect(openSessionBox).not.toBeNull();
    expect((loadDemoBox?.x ?? 0) + (loadDemoBox?.width ?? 0)).toBeLessThanOrEqual(390);
    expect((openSessionBox?.x ?? 0) + (openSessionBox?.width ?? 0)).toBeLessThanOrEqual(390);
  });
});
