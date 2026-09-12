const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const baseUrl = process.env.RESPONSIVE_BASE_URL || "http://127.0.0.1:3000";
const routes = ["/", "/home", "/share/1", "/quest/swap"];
const viewports = [
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
];

const outDir = path.join(process.cwd(), "artifacts", "responsive");
fs.mkdirSync(outDir, { recursive: true });

function slug(route) {
  if (route === "/") return "landing";
  return route.replace(/^\//, "").replaceAll("/", "-");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  const report = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    for (const route of routes) {
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
      page.on("pageerror", (err) => pageErrors.push(err.message));

      let response;
      try {
        response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(1800);
      } catch (error) {
        failures.push(`${viewport.name} ${route}: navigation failed: ${error.message}`);
        await page.close();
        continue;
      }

      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const body = document.body;
        const viewportWidth = window.innerWidth;
        const overflow = Math.max(root.scrollWidth, body?.scrollWidth || 0) - viewportWidth;
        const clipped = [];
        for (const el of Array.from(document.querySelectorAll("button, input, select, a, h1, h2, h3, p"))) {
          const style = getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden") continue;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (rect.right > viewportWidth + 3 || rect.left < -3) {
            clipped.push({
              tag: el.tagName,
              text: (el.textContent || el.getAttribute("placeholder") || "").trim().slice(0, 80),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
            });
          }
        }
        return {
          title: document.title,
          viewportWidth,
          scrollWidth: Math.max(root.scrollWidth, body?.scrollWidth || 0),
          horizontalOverflowPx: Math.max(0, overflow),
          clipped: clipped.slice(0, 12),
        };
      });

      const file = path.join(outDir, `${viewport.name}__${slug(route)}.png`);
      await page.screenshot({ path: file, fullPage: true });

      const status = response?.status() ?? 0;
      report.push({ viewport: viewport.name, route, status, ...metrics, consoleErrors, pageErrors, screenshot: path.relative(process.cwd(), file) });

      if (status >= 500 || status === 0) failures.push(`${viewport.name} ${route}: HTTP ${status}`);
      if (metrics.horizontalOverflowPx > 3) failures.push(`${viewport.name} ${route}: horizontal overflow ${metrics.horizontalOverflowPx}px`);
      if (metrics.clipped.length) failures.push(`${viewport.name} ${route}: ${metrics.clipped.length} key elements extend outside viewport`);
      if (pageErrors.length) failures.push(`${viewport.name} ${route}: page errors: ${pageErrors.join(" | ")}`);

      await page.close();
    }
    await context.close();
  }

  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify({ baseUrl, report, failures }, null, 2));
  await browser.close();

  for (const row of report) {
    console.log(`${row.viewport} ${row.route} HTTP ${row.status} overflow=${row.horizontalOverflowPx}px clipped=${row.clipped.length} consoleErrors=${row.consoleErrors.length} pageErrors=${row.pageErrors.length}`);
  }

  if (failures.length) {
    console.error("\nResponsive smoke failures:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("\nResponsive smoke test passed for all routes and viewports.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
