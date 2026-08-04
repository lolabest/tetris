import { test, expect } from "@playwright/test";

test("starts a session, shows board and stats, pauses and resumes", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Piano Blocks" }).first(),
  ).toBeVisible();
  await expect(page.getByTestId("start-button")).toBeVisible();
  await page.getByTestId("start-button").click();

  await expect(page.getByTestId("game-board")).toBeVisible();
  await expect(page.getByTestId("game-stats")).toBeVisible();
  await expect(page.getByTestId("stat-score")).toBeVisible();
  await expect(page.getByTestId("stat-level")).toBeVisible();
  await expect(page.getByTestId("next-piece")).toBeVisible();
  await expect(page.getByTestId("hold-piece")).toBeVisible();

  await page.keyboard.press("p");
  await expect(page.getByTestId("pause-overlay")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Paused" })).toBeVisible();

  await page.getByTestId("resume-button").click();
  await expect(page.getByTestId("pause-overlay")).toHaveCount(0);
  await expect(page.getByTestId("game-board")).toBeVisible();
});
