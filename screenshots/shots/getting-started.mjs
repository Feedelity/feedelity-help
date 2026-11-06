import { CASE, HEADING, WIZARD, CHECKLIST } from "./common.mjs"

export default [

  // --- Getting started -----------------------------------------------------------------
  {
    out: "images/getting-started/create-account/signup.png",
    url: "/signup", loggedOut: true, ready: "input[type=email]",
    zoom: { target: [HEADING, "form", "button:has-text('Microsoft')"], padding: 48 },
  },
  {
    out: "images/getting-started/create-account/login.png",
    url: "/login", loggedOut: true, ready: "input[type=password]",
    zoom: { target: [HEADING, "form", "button:has-text('Microsoft')"], padding: 48 },
    highlight: "a[href$='/forgot']",
  },
  {
    out: "images/getting-started/create-account/forgot.png",
    url: "/forgot", loggedOut: true, ready: "input[type=email]",
    zoom: { target: [HEADING, "form"], padding: 48 },
  },
  {
    out: "images/getting-started/create-organization/business-type.png",
    url: "/organizations/new", ready: "text=What kind of business do you run?",
    zoom: { target: WIZARD, padding: 32 },
  },
  {
    out: "images/getting-started/create-organization/brand-name.png",
    url: "/organizations/new", ready: "text=What kind of business do you run?",
    steps: async (page, { click }) => {
      await click(page.getByRole("button", { name: "Restaurant" }))
      await page.getByText("How many locations do you operate?").waitFor()
      await click(page.locator("button").filter({ hasText: /\d/ }).first())
      await page.getByPlaceholder("Burger Bros.").fill("Burger Bros.")
    },
    zoom: { target: WIZARD, padding: 32 },
  },
  {
    out: "images/getting-started/checklist/sidebar-item.png",
    url: "/home", sidebar: true,
    zoom: { target: "button:has-text('Set up your workspace')", padding: 40 },
    highlight: "button:has-text('Set up your workspace')",
  },
  {
    out: "images/getting-started/checklist/panel.png",
    url: "/home", sidebar: true,
    steps: async (page, { click }) => {
      await click(page.getByRole("button", { name: "Set up your workspace" }))
      await page.locator(CHECKLIST).waitFor()
    },
    keepChecklist: true,
    zoom: { target: CHECKLIST, padding: 4 },
  },
  {
    out: "images/getting-started/connect-first-channel/add-integration.png",
    url: "/settings/integrations", ready: "button:has-text('Add integration')",
    steps: async (page, { click }) => {
      await click(page.getByRole("button", { name: "Add integration" }))
      await page.locator("[role=dialog]").waitFor()
    },
    zoom: { target: "[role=dialog]", padding: 4 },
    highlight: "[role=dialog] .cursor-pointer:has-text('Google Business Profile')",
  },
]
