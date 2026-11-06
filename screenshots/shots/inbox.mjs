import { CASE } from "./common.mjs"

// Cases picked from the dev organization's data.
const GOOGLE_CASE = "/inbox?is_open=true&case_id=472617" // Google review with a positive and a negative tag
const URGENT_CASE = "/inbox?is_open=true&case_id=474431" // urgent case

const LIST_HEADER = "div.flex-col.border-b.p-4:has(input[placeholder='Search...'])" // Inbox title, search, Filters, filter bar
const TABS = "div.grid.grid-cols-3.rounded-md" // Open / Closed / All
const DETAILS = "div.flex-1.flex.flex-col.h-full.min-w-0" // the open case, with its sidebar
const CASE_HEADER = "div.gap-4.border-b.p-4" // customer, actions and tags of the open case
const ACTIONS = `${CASE_HEADER} div.justify-end.gap-1`
const TAGS = `${CASE_HEADER} > div.flex.flex-wrap`
const REPLY = "div.rounded-2xl:has(textarea[placeholder='Write your reply...'])"
const PROPERTIES = "h3:has-text('Properties')"
const COMMENT_FORM = "form:has(textarea[placeholder^='Write a comment'])"
const POPUP = "[data-radix-popper-content-wrapper]" // open menu or popover

export default [

  // --- Inbox ---------------------------------------------------------------------------
  { out: "images/inbox/overview/inbox.png", url: GOOGLE_CASE, ready: REPLY },
  {
    out: "images/inbox/overview/tabs.png",
    url: GOOGLE_CASE, ready: CASE,
    zoom: { target: [TABS, CASE], padding: 24 },
    highlight: TABS,
  },
  {
    out: "images/inbox/overview/case.png",
    url: GOOGLE_CASE, ready: REPLY,
    zoom: { target: DETAILS, padding: 0 },
  },
  {
    out: "images/inbox/overview/case-actions.png",
    url: GOOGLE_CASE, ready: REPLY,
    zoom: { target: CASE_HEADER, padding: 0 },
    highlight: ACTIONS,
  },
  {
    out: "images/inbox/filtering-and-searching/filter-bar.png",
    url: "/inbox?is_open=true", ready: CASE,
    steps: async (page, { click }) => {
      await click(page.getByRole("button", { name: "Filters" }))
      await click(page.locator(LIST_HEADER).getByRole("button", { name: "Rating", exact: true }))
      await page.locator(POPUP).waitFor()
    },
    zoom: { target: ["div.text-xl.font-bold.cursor-pointer", `${LIST_HEADER} button:has-text('Assigned to')`, POPUP], padding: 24 },
  },
  {
    out: "images/inbox/folders/inbox-menu.png",
    url: "/inbox?is_open=true", ready: CASE,
    steps: async (page, { click }) => {
      await click(page.locator("div.text-xl.font-bold.cursor-pointer"))
      await page.locator(POPUP).waitFor()
    },
    zoom: { target: ["div.text-xl.font-bold.cursor-pointer", POPUP], padding: 12 },
  },
  {
    out: "images/inbox/folders/settings.png",
    url: "/settings/folders", ready: "button:has-text('Add rule')",
    zoom: { target: ["h1:has-text('Folders'), h2:has-text('Folders')", "button:has-text('Add folder')", "button:has-text('Add rule')"], padding: 72 },
    highlight: "button:has-text('Add folder')",
  },
  {
    out: "images/inbox/exporting/export.png",
    url: "/inbox/export", ready: "button:has-text('Export Data')",
    zoom: { target: ["text=Data Export", "button:has-text('Export Data')"], padding: 48 },
  },
  {
    out: "images/inbox/bulk-actions/bulk.png",
    url: "/bulk", ready: "textarea",
    steps: async (page) => {
      // Typed only, never sent: stands in for a generated draft.
      await page.locator("textarea").first().fill("Bedankt voor je review, Metehan! Fijn dat het eten je smaakte. We nemen je opmerking over de prijzen mee.")
    },
    highlight: "button:has-text('Generate')",
  },
  {
    out: "images/inbox/replying/reply-box.png",
    url: GOOGLE_CASE, ready: REPLY,
    zoom: { target: REPLY, padding: 16 },
    highlight: `${REPLY} div.justify-between`,
  },
  {
    out: "images/inbox/tags-sentiment-priority/tags.png",
    url: GOOGLE_CASE, ready: REPLY,
    zoom: { target: CASE_HEADER, padding: 0 },
    highlight: `${TAGS} > div.flex-wrap`,
  },
  {
    out: "images/inbox/tags-sentiment-priority/priority.png",
    url: URGENT_CASE, ready: CASE_HEADER,
    steps: async (page, { click }) => {
      await click(page.locator(`${ACTIONS} button`).nth(1))
      await page.locator(POPUP).waitFor()
    },
    zoom: { target: [ACTIONS, POPUP], padding: 24 },
  },
  {
    out: "images/inbox/assigning-and-comments/details.png",
    url: GOOGLE_CASE, ready: REPLY,
    zoom: { target: [PROPERTIES, COMMENT_FORM], padding: 16 },
    highlight: "[role=region] button:has-text('Assign')",
  },
  {
    // Typing a draft is fine; it's never sent. "Improve reply" only opens the menu.
    out: "images/inbox/replying/improve-menu.png",
    url: GOOGLE_CASE, ready: REPLY,
    steps: async (page, { click }) => {
      await page.locator(`${REPLY} textarea`).fill("Thank you for your review! We're glad you enjoyed your bowl and hope to see you again soon.")
      await click(page.getByTitle("Improve reply"), { allow: "Improve reply" })
      await page.locator("[role=menu]").waitFor()
    },
    zoom: { target: [REPLY, "[role=menu]"], padding: 16 },
  },
]
