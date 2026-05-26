const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "artifacts", "professor-guide", "screenshots");
const MANIFEST = path.join(ROOT, "artifacts", "professor-guide", "slide-manifest.json");
const SLIDE_COUNT = 10;
const APP_URL = process.env.APP_URL || "http://localhost:3001";

async function waitForStableSlide(page) {
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await page.waitForSelector(".slide-surface", { timeout: 30000 });
  await page.waitForTimeout(1800);
}

async function readSlideState(page, index) {
  return page.evaluate((slideIndex) => {
    const text = (selector) =>
      document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim() || "";
    const surface = document.querySelector(".slide-surface");
    return {
      index: slideIndex,
      current: text(".topbar-progress__num"),
      total: text(".topbar-progress__num--mute"),
      percent: text(".topbar-progress__pct"),
      chapter: text(".topbar-chapter"),
      title: text(".slide-head h2") || text(".intro-hero__title"),
      subtitle: text(".head-sub") || text(".intro-hero__byline"),
      surfaceClass: surface?.className || "",
    };
  }, index);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const manifest = [];
  await page.goto(APP_URL, { waitUntil: "networkidle", timeout: 60000 });

  for (let i = 0; i < SLIDE_COUNT; i += 1) {
    await waitForStableSlide(page);
    const state = await readSlideState(page, i);
    const filename = `slide-${String(i + 1).padStart(2, "0")}-${state.current || String(i).padStart(2, "0")}.png`;
    const screenshotPath = path.join(OUT_DIR, filename);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    manifest.push({ ...state, screenshot: screenshotPath });

    if (i < SLIDE_COUNT - 1) {
      if (state.surfaceClass.includes("slide-surface--generator")) {
        await page.click(".genform__cta", { timeout: 30000 });
        await page.waitForTimeout(900);
        continue;
      }
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(450);
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2), "utf8");
  await browser.close();
  console.log(`Captured ${manifest.length} slides to ${OUT_DIR}`);
})();
