import { CASE } from "./common.mjs"

const CONTENT = "div.mx-auto.w-full.max-w-3xl" // the settings page column, without the settings menu
const section = (title) => `[data-slot=page-section]:has(h2:has-text('${title}'))`
const DIALOG = "[role=dialog]"
const blur = (page) => page.evaluate(() => { document.activeElement?.blur(); getSelection()?.removeAllRanges() })
const openAgentMenu = async (page, { click }) => {
  await click(page.getByRole("button", { name: "Add agent" }))
  await page.locator("[role=menu]").waitFor()
}
const openAgent = async (page, { click }) => {
  await click(page.locator("a[href^='/settings/agents/']").first())
  await page.getByText("Write a test review").waitFor()
}
const SUBMISSIONS = "text=/\\d+ submissions?/"
const FORMS_LIST = { target: ["h1:has-text('Forms')", "text=New form", "button:has-text('Share')", SUBMISSIONS], padding: 24 }

export default [

  // --- Automation: AI reply agents -------------------------------------------------------
  {
    out: "images/automation/agents/list.png",
    url: "/settings/agents", ready: "a[href^='/settings/agents/']",
    zoom: { target: CONTENT, padding: 8 },
  },
  {
    out: "images/automation/agents/add-menu.png",
    url: "/settings/agents", ready: "a[href^='/settings/agents/']",
    steps: openAgentMenu,
    zoom: { target: ["button:has-text('Add agent')", "[role=menu]"], padding: 12 },
    highlight: "button:has-text('Add agent')",
  },
  {
    out: "images/automation/agents/generate.png",
    url: "/settings/agents", ready: "a[href^='/settings/agents/']",
    steps: openAgentMenu,
    zoom: { target: ["button:has-text('Add agent')", "[role=menu]"], padding: 12 },
    highlight: "[role=menuitem]:has-text('Generate from my replies')",
  },
  {
    out: "images/automation/agents/editor.png",
    url: "/settings/agents", ready: "a[href^='/settings/agents/']",
    steps: openAgent,
  },
  {
    out: "images/automation/agents/test.png",
    url: "/settings/agents", ready: "a[href^='/settings/agents/']",
    steps: openAgent,
    zoom: { target: ["text=Write a test review", "text=Hit Generate reply"], padding: 32 },
    highlight: "button:has-text('Generate reply')",
  },
  {
    out: "images/automation/agents/snippets.png",
    url: "/settings/agents", ready: "a[href^='/settings/agents/']",
    zoom: { target: section("Smart snippets"), padding: 16 },
    highlight: "button:has-text('Add smart snippet')",
  },
  {
    out: "images/automation/agents/snippet-dialog.png",
    url: "/settings/agents", ready: "a[href^='/settings/agents/']",
    steps: async (page, { click }) => {
      await click(page.getByRole("button", { name: "Add smart snippet" }))
      await page.locator(DIALOG).waitFor()
      await page.locator(`${DIALOG} input`).first().fill("Parking policy")
      await page.locator(`${DIALOG} textarea`).first().fill("We offer free parking for 2 hours.")
      await blur(page)
    },
    zoom: { target: DIALOG, padding: 4 },
  },

  // --- Automation: auto reply ---------------------------------------------------------
  {
    out: "images/automation/auto-reply/list.png",
    url: "/settings/autoreply", ready: "table",
    zoom: { target: CONTENT, padding: 8 },
  },
  {
    out: "images/automation/auto-reply/new.png",
    url: "/settings/autoreply/new", ready: "#reply-rule-name",
    steps: async (page, { click }) => {
      await page.locator("#reply-rule-name").fill("Happy guests")
      await click(page.getByRole("button", { name: "Google", exact: true }))
      await click(page.getByRole("button", { name: "Uber Eats", exact: true }))
      await click(page.getByRole("button", { name: "4", exact: true }))
      await click(page.getByRole("button", { name: "5", exact: true }))
      await page.locator("form textarea").first().fill("Thank you for the great rating! We hope to see you again soon.")
      await click(page.getByRole("button", { name: "Add variant" }))
      await page.locator("form textarea").nth(1).fill("Thanks for your stars! The whole team appreciates it.")
      await blur(page)
    },
    zoom: { target: CONTENT, padding: 8 },
  },

  // --- Automation: templates ----------------------------------------------------------
  {
    out: "images/automation/templates/list.png",
    url: "/settings/templates", ready: "text=New template",
    zoom: { target: CONTENT, padding: 8 },
    highlight: "a:has-text('New template'), button:has-text('New template')",
  },
  {
    out: "images/automation/templates/new.png",
    url: "/settings/templates/new", ready: "form",
    steps: async (page) => {
      await page.locator("form input").first().fill("Thanks for your feedback")
      await blur(page)
    },
    zoom: { target: CONTENT, padding: 8 },
  },

  // --- Collecting feedback: forms -------------------------------------------------------
  {
    out: "images/collecting-feedback/forms/list.png",
    url: "/settings/forms", ready: SUBMISSIONS,
    zoom: FORMS_LIST,
  },
  {
    out: "images/collecting-feedback/forms/submission-count.png",
    url: "/settings/forms", ready: SUBMISSIONS,
    zoom: FORMS_LIST,
    highlight: SUBMISSIONS,
  },
  {
    out: "images/collecting-feedback/forms/editor.png",
    url: "/settings/forms/new", ready: "text=Questions",
    steps: async (page) => {
      await page.getByPlaceholder("e.g. Guest satisfaction").fill("Guest satisfaction")
      await blur(page)
    },
  },
  {
    out: "images/collecting-feedback/forms/share.png",
    url: "/settings/forms", ready: SUBMISSIONS,
    steps: async (page, { click }) => {
      await click(page.getByRole("button", { name: "Share" }).first())
      await page.locator(DIALOG).waitFor()
      await blur(page)
    },
    zoom: { target: DIALOG, padding: 4 },
  },

  // --- Collecting feedback: QR codes ----------------------------------------------------
  {
    // Opening the page logs one QR scan for this location; tapping a face would log a sentiment, so the shot doesn't.
    out: "images/collecting-feedback/qr-codes/sentiment.png",
    url: "/forms/f4c75c15-9de5-42b3-92d6-4ffa2104aa83", loggedOut: true, ready: "text=How was your experience?",
    viewport: { width: 390, height: 844 }, // the guest page is built for phones
  },
  {
    out: "images/collecting-feedback/qr-codes/case.png",
    url: "/inbox?channels=7", ready: CASE,
    steps: async (page, { click }) => {
      await click(page.locator(CASE).first())
      await page.getByText("Translate").first().waitFor()
    },
    zoom: { target: "div.rounded-md.border.p-5:has-text('Translate')", padding: 12 },
  },
  {
    out: "images/collecting-feedback/qr-codes/location-qr.png",
    url: "/settings/instore", ready: "table",
    steps: async (page) => { await page.locator(`${section("Location QR codes")} h2`).scrollIntoViewIfNeeded() },
    zoom: { target: [`${section("Location QR codes")} h2`, "table tbody tr:nth-child(4)"], padding: 24 },
    highlight: "table tbody tr:first-child td:last-child button",
  },
  {
    out: "images/collecting-feedback/qr-codes/settings.png",
    url: "/settings/instore", ready: "table",
    zoom: { target: section("Themes"), padding: 16 },
  },

  // --- Loyalty ------------------------------------------------------------------------
  {
    out: "images/loyalty/games/editor.png",
    url: "/settings/games/new", ready: "text=Outcomes",
    steps: async (page) => {
      await page.getByPlaceholder("Summer game").fill("Summer game")
      await blur(page)
    },
  },
  {
    out: "images/loyalty/games/outcomes.png",
    url: "/settings/games/new", ready: "text=Outcomes",
    zoom: { target: section("Outcomes"), padding: 16 },
    highlight: "text=Add prize",
  },
  {
    out: "images/loyalty/offers/new.png",
    url: "/settings/offers/new", ready: "text=Voucher codes",
    steps: async (page) => {
      await page.getByPlaceholder("Free drink").first().fill("Free drink")
      await page.locator("textarea").first().fill("Enjoy a free drink of your choice with any purchase. Show this code at the counter. Minimum purchase of €10.")
      await blur(page)
    },
    zoom: { target: CONTENT, padding: 8 },
  },
  {
    // "Generate variants" only opens the popover; the 5/10/25/50 options inside it generate, so they're never clicked.
    out: "images/automation/auto-reply/generate-variants.png",
    url: "/settings/autoreply/new", ready: "#reply-rule-name",
    steps: async (page, { click }) => {
      // Fill the rule like the form shot above, so the popover doesn't show "Pick at least one…" warnings.
      await page.locator("#reply-rule-name").fill("Happy guests")
      await click(page.getByRole("button", { name: "Google", exact: true }))
      await click(page.getByRole("button", { name: "4", exact: true }))
      await click(page.getByRole("button", { name: "5", exact: true }))
      await page.locator("form textarea").first().fill("Thank you for the great rating! We hope to see you again soon.")
      await blur(page)
      await click(page.getByRole("button", { name: "Generate variants" }), { allow: "Generate variants" })
      await page.locator("[data-radix-popper-content-wrapper]").waitFor()
    },
    zoom: { target: ["button:has-text('Generate variants')", "[data-radix-popper-content-wrapper]"], padding: 16 },
  },
]
