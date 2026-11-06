// Connecting your channels: integrations/*.mdx
// Account ids are looked up at runtime by clicking the platform's row on /settings/integrations.

const LIST = "/settings/integrations"
const ROWS = "table tbody tr" // the Connected status dot pulses forever, so the default ready check never passes
const HEADER = "[data-slot=integration-header]"
const CONTENT = "[data-slot=integration-content]"
const SETUP_ZOOM = { target: [HEADER, CONTENT], padding: 48 }

// Open an account's detail page from the list; returns its id.
const openAccount = async (page, click, platform) => {
  await click(page.locator(ROWS, { hasText: platform }).first().locator("td").first())
  await page.waitForURL(/\/settings\/integrations\/\d+$/)
  await page.getByText("Inbox automation").waitFor()
  return page.url().split("/").pop()
}
// "Add channel" page of an existing account (opening it only reads; nothing is connected until Continue).
const channelsNew = (platform, ready) => async (page, { click }) => {
  const id = await openAccount(page, click, platform)
  await page.goto(`/integrations/accounts/${id}/channels/new`)
  await page.locator(ready).first().waitFor({ timeout: 120000 })
}

export default [
  {
    out: "images/integrations/how-integrations-work/list.png",
    url: LIST, ready: ROWS,
    highlight: "button:has-text('Add integration')",
  },
  {
    out: "images/integrations/how-integrations-work/add-integration.png",
    url: LIST, ready: ROWS,
    steps: async (page, { click }) => {
      await click(page.getByRole("button", { name: "Add integration" }))
      await page.locator("[role=dialog]").waitFor()
    },
    zoom: { target: "[role=dialog]", padding: 4 },
  },
  {
    out: "images/integrations/how-integrations-work/location-picker.png",
    url: LIST, ready: ROWS,
    steps: async (page, { click }) => {
      await openAccount(page, click, "Deliveroo")
      await click(page.locator("[role=combobox]").first())
      await page.locator("[data-radix-popper-content-wrapper]").waitFor()
    },
    zoom: { target: ["text=Channels >> nth=0", "button:has-text('Add channel')", "[data-radix-popper-content-wrapper]"], padding: 24 },
    highlight: "[role=combobox] >> nth=0",
  },
  {
    out: "images/integrations/how-integrations-work/inbox-automation.png",
    url: LIST, ready: ROWS,
    steps: async (page, { click }) => {
      await openAccount(page, click, "Tripadvisor")
      await page.locator("[role=radiogroup]").scrollIntoViewIfNeeded()
    },
    zoom: { target: ["text=Inbox automation", "[role=radiogroup]"], padding: 32 },
  },
  {
    out: "images/integrations/manage/delete-menu.png",
    url: LIST, ready: ROWS,
    steps: async (page, { click }) => {
      await openAccount(page, click, "Tripadvisor")
      await click(page.locator("button:has(svg.lucide-ellipsis)").first())
      await page.locator("[role=menu]").waitFor()
    },
    zoom: { target: ["button:has(svg.lucide-ellipsis)", "[role=menu]"], padding: 32 },
    highlight: "[role=menuitem]:has-text('Delete integration')",
  },

  // Account login forms for platforms not connected yet: shown empty, never submitted.
  {
    out: "images/integrations/deliveroo/login.png",
    url: "/integrations/accounts/new/4", ready: "text=Log in with Deliveroo",
    zoom: SETUP_ZOOM,
  },
  {
    out: "images/integrations/zenchef/login.png",
    url: "/integrations/accounts/new/9", ready: "text=Log in with Zenchef",
    zoom: SETUP_ZOOM,
  },
  {
    out: "images/integrations/uber-eats/invite.png",
    url: "/integrations/accounts/new/6", ready: "text=Invite Feedelity to Uber Eats",
    zoom: SETUP_ZOOM,
    highlight: `${CONTENT} >> text=Email support`,
  },


  // Form channels: filled with obviously fake example values, never submitted.
  {
    out: "images/integrations/just-eat/page-link.png", url: LIST, ready: ROWS,
    steps: async (page, ctx) => {
      await channelsNew("Just Eat", "input#url")(page, ctx)
      await page.locator("input#url").fill("https://www.just-eat.co.uk/restaurants-yourrestaurant")
    },
    zoom: SETUP_ZOOM,
  },
  {
    out: "images/integrations/tripadvisor/page-link.png", url: LIST, ready: ROWS,
    steps: async (page, ctx) => {
      await channelsNew("Tripadvisor", "input#url")(page, ctx)
      await page.locator("input#url").fill("https://www.tripadvisor.com/Restaurant_Review-demo")
    },
    zoom: SETUP_ZOOM,
  },
  {
    out: "images/integrations/outlook/add-mailbox.png", url: LIST, ready: ROWS,
    steps: async (page, ctx) => {
      await channelsNew("Outlook", "input#email")(page, ctx)
      await page.locator("input#email").fill("feedback@yourrestaurant.com")
    },
    zoom: SETUP_ZOOM,
  },
]
