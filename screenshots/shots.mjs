// Recapture help center screenshots from a running Feedelity web-app.
//
//   npm run shots [-- filter]      (reads FEEDELITY_EMAIL, FEEDELITY_PASSWORD, FEEDELITY_ORG_ID, BASE_URL from .env)
//
// `filter` only runs shots whose `out` path contains it, e.g. `npm run shots -- getting-started/`.
import { chromium } from "playwright"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { mkdirSync } from "node:fs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000"
const { FEEDELITY_EMAIL, FEEDELITY_PASSWORD, FEEDELITY_ORG_ID } = process.env

// Each shot:
//   out        image path in the docs repo
//   url        page to open
//   loggedOut  take it in a fresh session without login (sign-up, log-in screens)
//   sidebar    true to keep the app sidebar expanded; by default it's collapsed, because it rarely adds anything
//   ready      selector that means the page's data has loaded (default: app shell drawn, no skeletons left)
//   steps      async (page, { click }) => ... to get the UI into place. Use `click`, never page.click:
//              it refuses buttons that send, save or create anything, because this runs against real data.
//   zoom       { target: selector | selector[], padding } to crop around those elements instead of the full window
//   highlight  selector to draw a brand-colored box around
//   hover      selector to hover before capturing (reveals hover-only buttons)
//   viewport   { width, height } for this shot only, e.g. { width: 390, height: 844 } for pages built for phones
//   keepChecklist  leave the "Set up your workspace" panel open; by default it's closed so it doesn't cover the page
import { readdirSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { CHECKLIST } from "./shots/common.mjs"

// Shot lists live in shots/*.mjs, one file per docs section; each exports an array of shots.
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), "shots")
// first-batch.mjs loads first, so a section file that redefines one of its images wins.
const files = readdirSync(shotsDir).filter((f) => f.endsWith(".mjs") && f !== "common.mjs")
  .sort((a, b) => (b === "first-batch.mjs") - (a === "first-batch.mjs") || a.localeCompare(b))
const byOut = new Map()
for (const file of files) {
  for (const shot of (await import(pathToFileURL(join(shotsDir, file)))).default) byOut.set(shot.out, shot)
}
const shots = [...byOut.values()]

if (!FEEDELITY_EMAIL || !FEEDELITY_PASSWORD || !FEEDELITY_ORG_ID) {
  throw new Error("Set FEEDELITY_EMAIL, FEEDELITY_PASSWORD and FEEDELITY_ORG_ID")
}

// Buttons a shot must never press: they send, save, create or delete something.
const FORBIDDEN = /send|save|submit|create|continue|finish|publish|delete|remove|invite|export|generate|reply|confirm|pay|subscribe/i
// `allow` lets one known-safe button through when its label contains that exact text,
// e.g. click(button, { allow: "Improve reply" }) only opens the Improve menu.
const click = async (locator, { allow } = {}) => {
  const label = `${await locator.innerText().catch(() => "")} ${await locator.getAttribute("title").catch(() => "")}`
  const allowed = allow && label.includes(allow)
  if (FORBIDDEN.test(label) && !allowed) throw new Error(`refused to click "${label.trim()}"`)
  await locator.click()
}

const filter = process.argv[2] ?? ""
// ponytail: uses the installed Google Chrome, so no Playwright browser download is needed.
const browser = await chromium.launch({ channel: "chrome" })
const newContext = () => browser.newContext({
  baseURL: BASE_URL,
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: "en-US",
  colorScheme: "light",
  reducedMotion: "reduce",
})

// Logged-in session: log in once through the real form; the cookies carry over to every shot.
const app = await newContext()
const appPage = await app.newPage()
await appPage.goto("/login")
await appPage.locator("input[name=email]").fill(FEEDELITY_EMAIL)
await appPage.locator("input[name=password]").fill(FEEDELITY_PASSWORD)
await appPage.locator("button[type=submit]").click()
await appPage.waitForURL((url) => !url.pathname.includes("/login"))
// The app reads the active organization from this cookie.
await app.addCookies([{ name: "organization_id", value: FEEDELITY_ORG_ID, url: BASE_URL }])
const guestPage = await (await newContext()).newPage()

// The app keeps a live events connection open, so "networkidle" never fires.
for (const p of [appPage, guestPage]) p.setDefaultTimeout(30000)
const skipTour = async (page) => {
  // Skipping marks the tour as seen in localStorage, so it stays away for the rest of the run.
  const skip = page.getByText("Skip tour")
  if (await skip.isVisible()) await skip.click()
}
// Wait for loading spinners to go, then 1s for images and late renders.
const settle = async (page) => {
  await page.waitForTimeout(500) // give a spinner time to appear before waiting it out
  await page.waitForFunction(() => !document.querySelector(".animate-spin"))
  await page.waitForTimeout(1000)
}
// Bounding box around all targets plus padding, kept inside the window.
const zoomClip = async (page, { target, padding = 32 }) => {
  const boxes = []
  for (const selector of [target].flat()) boxes.push(await page.locator(selector).locator("visible=true").first().boundingBox())
  const { width, height } = page.viewportSize()
  const x = Math.max(0, Math.min(...boxes.map((b) => b.x)) - padding)
  const y = Math.max(0, Math.min(...boxes.map((b) => b.y)) - padding)
  return {
    x, y,
    width: Math.min(width, Math.max(...boxes.map((b) => b.x + b.width)) + padding) - x,
    height: Math.min(height, Math.max(...boxes.map((b) => b.y + b.height)) + padding) - y,
  }
}

for (const shot of shots.filter((s) => s.out.includes(filter))) {
  const page = shot.loggedOut ? guestPage : appPage
  try {
    if (!shot.loggedOut) {
      await app.addCookies([{ name: "sidebar_state", value: String(!!shot.sidebar), url: BASE_URL }])
    }
    await page.setViewportSize(shot.viewport ?? { width: 1440, height: 900 })
    await page.goto(shot.url)
    if (shot.ready) await page.locator(shot.ready).first().waitFor()
    else {
      // The app has no <main>; the sidebar's Inbox link means the shell has drawn.
      await page.locator('a[href^="/inbox"]').first().waitFor()
      await page.waitForTimeout(1500) // let the page start loading its data
      await page.waitForFunction(() => !document.querySelector(".animate-pulse"))
    }
    await settle(page)
    await skipTour(page)
    if (shot.steps) {
      await shot.steps(page, { click })
      await settle(page)
      await skipTour(page)
    }
    if (!shot.keepChecklist) {
      // The checklist panel stays open across pages once opened; close it with its ✕ (the second header button).
      const panel = page.locator(CHECKLIST)
      if (await panel.isVisible()) await panel.locator("button.w-6.h-6").nth(1).click()
    }
    // Clear hover states, or hover the shot's `hover` target to reveal hover-only buttons.
    if (shot.hover) await page.locator(shot.hover).first().hover()
    else await page.mouse.move(0, 0)
    if (shot.highlight) {
      // Draw a box over the page instead of styling the element, so overflow can't clip it.
      await page.locator(shot.highlight).locator("visible=true").first().evaluate((el) => {
        const r = el.getBoundingClientRect()
        const box = document.createElement("div")
        Object.assign(box.style, {
          position: "fixed", zIndex: 2147483647, pointerEvents: "none",
          left: `${r.left - 5}px`, top: `${r.top - 5}px`, width: `${r.width + 10}px`, height: `${r.height + 10}px`,
          border: "3px solid #3A25C1", borderRadius: "8px",
        })
        document.body.append(box)
      })
    }
    const path = join(root, shot.out)
    mkdirSync(dirname(path), { recursive: true })
    const clip = shot.zoom ? await zoomClip(page, shot.zoom) : undefined
    await page.screenshot({ path, clip, animations: "disabled" })
    console.log("saved", shot.out)
  } catch (error) {
    // One broken shot shouldn't stop the run; report it and move on.
    console.log("FAILED", shot.out, error.message.split("\n")[0])
  }
}

await browser.close()
