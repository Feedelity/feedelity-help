// Home, Issues and tasks, AI chat, Analytics.
const FILTERS = "div.flex.flex-wrap.flex-row.gap-2:has(button:has-text('Channel'))" // location, channel and date filters
const TABLE_ROW = "tbody tr"
// Tables and charts load after a tab switch; wait out their skeletons.
const loaded = (page) => page.waitForFunction(() => !document.querySelector(".animate-pulse"), null, { timeout: 60000 })
const tab = (name, after) => async (page, ctx) => {
  await ctx.click(page.getByRole("button", { name, exact: true }))
  await page.waitForTimeout(1000)
  await loaded(page)
  if (after) await after(page, ctx)
}
// Competitors: switch to the Gent location, then run `after`.
const gent = (after) => async (page, ctx) => {
  await ctx.click(page.locator("[role=combobox]").first())
  await ctx.click(page.locator("[data-radix-popper-content-wrapper] .cursor-pointer:has-text('Gent')").first())
  await page.waitForTimeout(3000)
  await loaded(page)
  if (after) await after(page, ctx)
}
// Mark the biggest bubble of a scatter chart so `hover` can find it.
const markBiggestBubble = async (page) => {
  await page.waitForTimeout(3000) // the chart re-renders once after loading, dropping the mark
  await page.evaluate(() => {
  const symbols = [...document.querySelectorAll(".recharts-scatter-symbol")]
  const area = (el) => { const r = el.getBoundingClientRect(); return r.width * r.height }
  // Skip bubbles hidden under labels or other bubbles, or hovering fails.
  const free = (el) => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)) }
  symbols.filter(free).sort((a, b) => area(b) - area(a))[0]?.setAttribute("data-shot", "bubble")
  })
}

export default [
  // --- Home ---
  { out: "images/home/home.png", url: "/home" },
  {
    out: "images/home/cards.png", url: "/home",
    zoom: { target: "div.grid.grid-cols-1.gap-2:has-text('Urgent feedback')", padding: 6 },
  },

  // --- Issues and tasks ---
  { out: "images/issues-and-tasks/issues/list.png", url: "/issues", ready: TABLE_ROW },
  { out: "images/issues-and-tasks/tasks/list.png", url: "/tasks", ready: "[data-tour=open-task]" },
  {
    out: "images/issues-and-tasks/tasks/task.png", url: "/tasks", ready: "[data-tour=open-task]",
    steps: async (page, { click }) => {
      await click(page.locator("[data-tour=open-task]"))
      await page.locator("[data-tour=share-task]").waitFor()
      await page.waitForTimeout(1000)
      await loaded(page)
    },
  },

  // --- Dashboard ---
  {
    out: "images/analytics/dashboard/filters.png", url: "/analytics/dashboard", ready: "button:has-text('Channel')",
    // The location filter only shows up after a tab switch.
    steps: tab("Channels", tab("Overview")),
    zoom: { target: ["h1", FILTERS, "[data-tour=dashboard-tabs]"], padding: 12 },
    highlight: FILTERS,
  },
  { out: "images/analytics/dashboard/overview.png", url: "/analytics/dashboard", steps: tab("Channels", tab("Overview")) },
  { out: "images/analytics/dashboard/channels.png", url: "/analytics/dashboard", steps: tab("Channels") },
  { out: "images/analytics/dashboard/tags.png", url: "/analytics/dashboard", steps: tab("Tags") },
  { out: "images/analytics/dashboard/key-drivers.png", url: "/analytics/dashboard", steps: tab("Key Drivers") },
  {
    out: "images/analytics/dashboard/key-drivers-tooltip.png", url: "/analytics/dashboard",
    steps: tab("Key Drivers", markBiggestBubble),
    hover: "[data-shot=bubble]",
    zoom: { target: "[data-tour=dashboard-drivers]", padding: 8 },
    highlight: "[data-tour=dashboard-drivers] :has(> button:text-is('Hierarchical'))",
  },
  {
    out: "images/analytics/dashboard/tag-details.png", url: "/analytics/dashboard",
    steps: tab("Tags", async (page, { click }) => {
      await click(page.getByText("Attitude", { exact: true }).first())
      await page.locator("[role=dialog]").waitFor()
      await page.waitForTimeout(1500)
      await loaded(page)
    }),
    zoom: { target: "[role=dialog]", padding: 0 },
  },

  // --- Benchmarks ---
  { out: "images/analytics/benchmarks/overview.png", url: "/analytics/benchmarks", ready: TABLE_ROW },
  {
    out: "images/analytics/benchmarks/map.png", url: "/analytics/benchmarks",
    steps: tab("Map", async (page) => {
      await page.locator(".maplibregl-marker").first().waitFor()
      await page.waitForTimeout(5000) // map tiles
    }),
    hover: ".maplibregl-marker >> nth=12",
  },
  { out: "images/analytics/benchmarks/channels.png", url: "/analytics/benchmarks", steps: tab("Channels") },
  {
    out: "images/analytics/benchmarks/tags.png", url: "/analytics/benchmarks", steps: tab("Tags"),
    hover: "tbody tr:nth-child(2) td:nth-child(4)",
  },

  // --- Ratings ---
  { out: "images/analytics/ratings/ratings.png", url: "/analytics/ratings", ready: TABLE_ROW },
  {
    out: "images/analytics/ratings/compare.png", url: "/analytics/ratings", ready: TABLE_ROW,
    steps: async (page, { click }) => {
      await click(page.getByRole("button", { name: "Compare" }))
      await click(page.getByText("Last 30 days", { exact: true }).first())
      await page.keyboard.press("Escape")
      await page.waitForTimeout(1500)
      await loaded(page)
    },
  },

  // --- Competitors (the first location isn't on Google; pick one that is) ---
  { out: "images/analytics/competitors/overview.png", url: "/analytics/competitors", ready: "[role=combobox]", steps: gent() },
  {
    out: "images/analytics/competitors/manage.png", url: "/analytics/competitors", ready: "[role=combobox]",
    steps: gent(async (page, { click }) => {
      await click(page.getByRole("button", { name: "Manage competitors" }))
      await page.locator("[role=dialog]").waitFor()
    }),
    zoom: { target: "[role=dialog]", padding: 0 },
  },
  {
    out: "images/analytics/competitors/rating.png", url: "/analytics/competitors", ready: "[role=combobox]",
    steps: gent(tab("Rating")), highlight: ":has(> button:text-is('Table'))",
  },
  { out: "images/analytics/competitors/subrating.png", url: "/analytics/competitors", ready: "[role=combobox]", steps: gent(tab("Subrating")) },
  { out: "images/analytics/competitors/responses.png", url: "/analytics/competitors", ready: "[role=combobox]", steps: gent(tab("Responses")) },

  // --- Opinions ---
  { out: "images/analytics/opinions/key-drivers.png", url: "/analytics/opinions", ready: "button:has-text('Channel')" },
  {
    out: "images/analytics/opinions/table.png", url: "/analytics/opinions", ready: "button:has-text('Channel')",
    steps: tab("Table", async (page, { click }) => {
      await click(page.locator("button:has-text('Most opinions')"))
      await page.locator("[role=menu], [role=listbox]").first().waitFor()
    }),
  },
  {
    out: "images/analytics/opinions/topic-details.png", url: "/analytics/opinions", ready: "button:has-text('Channel')",
    steps: tab("Table", async (page, { click }) => {
      await click(page.getByRole("cell", { name: "service", exact: true }).first())
      await page.locator("[role=dialog]").waitFor()
      await page.waitForTimeout(1500)
      await loaded(page)
    }),
    zoom: { target: "[role=dialog]", padding: 0 },
  },
]
