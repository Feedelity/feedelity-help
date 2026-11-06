import { CASE } from "./common.mjs"

// The centered content column of a settings or profile page, without the settings menu.
const CONTENT = "[data-slot=page-content] div.max-w-3xl"
const ROW = "tbody tr.cursor-pointer"
const DIALOG = "[role=dialog]"
const POPOVER = "[data-radix-popper-content-wrapper]"
const USER_MENU = "[data-sidebar=footer] button[aria-haspopup=menu] >> nth=-1" // your name at the bottom of the sidebar

// Open a row of a list and wait for its detail page.
const openRow = (row, url) => async (page, { click }) => {
  await click(page.locator(row).first())
  await page.waitForURL(url)
}
// Open the first case in the inbox that has tags.
const openTaggedCase = async (page, click) => {
  for (let i = 0; i < 15; i++) {
    await click(page.locator(CASE).nth(i))
    await page.waitForTimeout(1500)
    if (await page.locator("[data-tour=case-tags]").isVisible()) return
  }
  throw new Error("no tagged case in the first 15")
}

export default [

  // --- Organization settings -----------------------------------------------------------
  { out: "images/settings/general/general.png", url: "/settings/general", ready: "button:has-text('Save')", zoom: { target: CONTENT } },
  { out: "images/settings/billing/plan.png", url: "/settings/billing", ready: "a[href='/settings/locations'] >> nth=1", zoom: { target: CONTENT } },
  {
    out: "images/settings/flags/list.png", url: "/settings/flags", ready: "tbody tr",
    zoom: { target: CONTENT }, highlight: "button:has-text('Add indicator')",
  },
  { out: "images/settings/locations/list.png", url: "/settings/locations", ready: ROW, zoom: { target: CONTENT } },
  {
    out: "images/settings/locations/detail.png", url: "/settings/locations", ready: ROW,
    steps: openRow(`${ROW} >> nth=1`, /\/settings\/locations\/\d+/), // the first one has no address,
    zoom: { target: CONTENT },
  },
  { out: "images/settings/location-groups/list.png", url: "/settings/location-groups", ready: ROW, zoom: { target: CONTENT } },
  {
    out: "images/settings/location-groups/detail.png", url: "/settings/location-groups", ready: ROW,
    steps: openRow(ROW, /\/settings\/location-groups\/\d+/),
    zoom: { target: CONTENT },
  },
  { out: "images/settings/users/list.png", url: "/settings/users", ready: ROW, zoom: { target: CONTENT } },
  {
    out: "images/settings/users/invite.png", url: "/settings/users", ready: ROW,
    steps: async (page, { click }) => {
      await click(page.getByRole("button", { name: "Add user" }))
      const dialog = page.locator(DIALOG)
      await dialog.locator("input").first().fill("jane@example.com") // never sent
      await click(dialog.getByRole("combobox").first())
      // The option's description contains "reply", which the click guard refuses; pick it with the keyboard.
      await page.getByRole("option", { name: /Member/ }).focus()
      await page.keyboard.press("Enter")
    },
    zoom: { target: DIALOG, padding: 4 },
  },
  {
    out: "images/settings/users/detail.png", url: "/settings/users", ready: ROW,
    steps: openRow(`${ROW}:has-text('Member'):has-text('feedelity.invalid')`, /\/settings\/users\/\d+/),
    zoom: { target: CONTENT },
  },
  { out: "images/settings/security/domains.png", url: "/settings/security", ready: ROW, zoom: { target: CONTENT } },
  {
    out: "images/settings/security/domain.png", url: "/settings/security", ready: ROW,
    steps: async (page, { click }) => {
      await click(page.locator(ROW).first())
      await page.locator(DIALOG).waitFor()
      await page.evaluate(() => document.activeElement?.blur()) // hide the focus ring on the close button
    },
    zoom: { target: [`${DIALOG} h2`, `${DIALOG} button:has(svg.lucide-x)`, `${DIALOG} button:has-text('Remove domain')`], padding: 24 },
  },
  {
    out: "images/settings/tags/list.png", url: "/settings/tags", ready: "tbody tr",
    steps: async (page, { click }) => {
      await click(page.locator("tbody tr:has(svg.lucide-chevron-right)").first())
    },
    // The first sub-tag sits right under the expanded category.
    hover: "tbody tr:has(svg.lucide-chevron-right) + tr",
    highlight: "tbody tr:has(svg.lucide-chevron-right) + tr td:last-child > div",
    zoom: { target: CONTENT },
  },
  {
    out: "images/settings/tags/case-tags.png", url: "/inbox?is_open=true", ready: CASE,
    steps: async (page, { click }) => {
      await openTaggedCase(page, click)
    },
    zoom: { target: ["[data-tour=case-tags]", "[data-tour=add-case-tag]"], padding: 12 },
  },
  {
    out: "images/settings/tags/edit-tags.png", url: "/inbox?is_open=true", ready: CASE,
    steps: async (page, { click }) => {
      await openTaggedCase(page, click)
      await click(page.locator("[data-tour=add-case-tag] button"))
      await page.locator(POPOVER).waitFor()
    },
    zoom: { target: ["[data-tour=case-tags]", POPOVER], padding: 12 },
  },

  // --- Your profile ----------------------------------------------------------------------
  { out: "images/profile/profile/profile.png", url: "/profile", ready: "button:has-text('Leave organization')", zoom: { target: CONTENT } },
  {
    out: "images/profile/profile/language.png", url: "/home", sidebar: true,
    steps: async (page, { click }) => {
      await click(page.locator(USER_MENU))
      await page.getByRole("menuitem", { name: "Language" }).hover()
      await page.locator("[role=menu] >> nth=1").waitFor()
    },
    hover: "[role=menuitem]:has-text('Language')",
    highlight: "[role=menuitem]:has-text('Language')",
    zoom: { target: ["[role=menu] >> nth=0", "[role=menu] >> nth=1", USER_MENU], padding: 12 },
  },
  {
    out: "images/profile/notifications/emails.png", url: "/profile", ready: "button:has-text('Leave organization')",
    zoom: { target: "div:has(> h3) >> nth=0", padding: 12 },
  },
  {
    out: "images/profile/notifications/bell.png", url: "/inbox?is_open=true", ready: CASE,
    steps: async (page, { click }) => {
      await click(page.getByRole("button", { name: "Open notifications" }))
      await page.locator(POPOVER).waitFor()
    },
    highlight: "button[aria-label='Open notifications']",
    zoom: { target: ["button[aria-label='Open notifications']", POPOVER], padding: 24 },
  },
]
