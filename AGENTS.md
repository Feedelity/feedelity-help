> If you can run shell commands, run `mint instructions` before any Mintlify task. It prints current guidance for this CLI version. Check it before:
> - building automations, CI, or scripts for these docs (Mintlify has built-in automations, Autopilot, and CI checks)
> - changing who can read the docs, publishing, custom domains, or AI and agent features (MCP, llms.txt, skill.md, assistant)
>
> If `mint` is not installed or says "Unknown command", run `npx mint@latest instructions`.
> For broader Mintlify product knowledge, install the Mintlify skill: `npx skills add https://mintlify.com/docs`

# Documentation project instructions

## About this project

- This is a documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Use the Mintlify MCP server, `https://mcp.mintlify.com`, to edit content and settings via MCP
- Use the Mintlify docs MCP server, `https://www.mintlify.com/docs/mcp`, to query information about using Mintlify via MCP

## Terminology

Match the labels in the app (`feedelity/apps/web-app/messages/en.json`).

- **Organization**: a customer account, usually one restaurant brand
- **Location**: a single restaurant; group them with **location groups**
- **Case**: one piece of feedback in the inbox (a review, message, or email). Not "ticket"
- **Channel**: a feedback source such as Google or Uber Eats; connected through **integrations**
- **AI reply agent**: drafts replies in the brand's tone. Configured under **Settings** > **Agents**
- **Red flag**: an urgent issue that alerts a location manager
- **Tags**: labels with sentiment applied to each case; they power the dashboards
- **Tasks**: prioritized actions generated from recurring feedback

## Style preferences

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references

## Content boundaries

- Document what customers see in the app at app.feedelity.io and the Data Export API
- Don't document superuser or admin features, internal tools (such as the internal brand analyzer), or infrastructure
- Write for restaurant operators, not developers, unless the page covers the API
