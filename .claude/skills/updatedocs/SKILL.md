---
name: updatedocs
description: Update the Feedelity help center (this Mintlify repo) with the customer-facing changes from a pull request in Feedelity/feedelity. Use whenever the user wants the docs to reflect a PR, a merged feature, a release or a branch ("update the docs for PR #955", "document what shipped in #930", "the help center is out of date after this PR", "write docs for the order details feature"), even if they only paste a PR number or URL. Reads the PR and the app code, decides which help pages change, edits or adds MDX pages in the house style, marks the screenshots to retake, validates the site, and previews everything before committing.
---

# Update the docs from a pull request

Turn a pull request in `Feedelity/feedelity` into accurate changes to this help center. The app is the source of truth: the PR description says what changed, the code says how it really looks and behaves.

Read `AGENTS.md` first. Its terminology, style preferences and content boundaries apply to every word written here.

## Phase 1: Read the pull request

1. Get the PR number from the user (number, URL or branch). If they give none, ask.
2. Fetch it with the `gh` CLI:
   ```bash
   gh pr view <number> --repo Feedelity/feedelity --json number,title,body,state,mergedAt,headRefName,files,commits
   gh pr diff <number> --repo Feedelity/feedelity
   ```
3. If the PR is not merged, say so. Docs normally follow what is live. Ask whether to document it now anyway, for example ahead of a release.

## Phase 2: Find what a customer will notice

Sort the changes in the diff. Only the first kind is documented.

**Customer-facing.** Document it.
- New or changed screens, buttons, menus, banners and empty states in `apps/web-app`.
- Changed rules a customer runs into, such as when a reply is possible, limits, or which channels support a feature.
- New or changed copy in `apps/web-app/messages/en.json`.
- The Data Export API (`apps/export-api`).

**Not customer-facing.** Skip it.
- Clients, backend services, repositories, migrations and the worker.
- Refactors, tests, infrastructure, CI and generated files.
- Superuser and admin features, and internal tools such as the internal brand analyzer.
- Pure visual polish, such as colours, spacing and avatars. It only needs a screenshot retake, never new text.

Write the result as a short list of user-visible changes, one line each, with the screen it appears on. If nothing is customer-facing, say so and stop.

## Phase 3: Verify against the app code

Never document from the PR description alone.

1. Read the components the PR touched. The app repo is checked out next to this one at `../feedelity`. Read the PR's head branch there (`git -C ../feedelity show <headRefName>:<path>`), or the merged `main`.
2. Take every UI label verbatim from `apps/web-app/messages/en.json`: button names, titles, banner and toast text. Bold them as AGENTS.md says.
3. Check the conditions behind what a customer sees: which channels, plans, roles or add-ons it needs, and when it is hidden. A sentence like "only shows for Uber Eats and Deliveroo reviews with a written comment" is exactly what operators need.

## Phase 4: Map the changes to pages

1. Find the affected pages. Search the MDX for the feature's terms, and check `docs.json` for where a topic lives.
   ```bash
   git grep -n -i "<term>" -- "*.mdx"
   ```
2. For each change, pick one action:
   - **Edit an existing page.** This is the usual case: add a section, extend a list, or correct a sentence the PR made wrong.
   - **Add a new page.** Only for a genuinely new feature area. Add it to the right group in `docs.json` navigation, and link it from related pages.
   - **Fix contradictions.** Search for statements the PR made untrue, such as limits, button names or which platforms support something, and correct them everywhere.
3. Present the plan before writing: page, what changes, and why. Wait for the user's go-ahead.

## Phase 5: Write

Follow the existing pages. `inbox/replying.mdx` is a good model.

- **Frontmatter:** keep `title` and `description`. A new page gets both, in sentence case.
- **Voice:** second person and active, one idea per sentence. Explain what the operator can do and when, not how it is built.
- **UI labels:** bold, and matching the app exactly. Use `>` for navigation paths: **Settings** > **Users**.
- **Components:** use the Mintlify components already used in the repo, such as `<Steps>`, `<Tip>`, `<Note>`, `<Frame>` and `<kbd>`.
- **Links:** use relative links between pages, as in `/automation/agents#smart-snippets`.
- **Screenshots:** never invent an image path for a screenshot that doesn't exist. Where a new or changed screen needs one, add a placeholder comment in the repo's format, and leave existing images in place:
  ```mdx
  {/* SCREENSHOT: /inbox?case_id=<id of an Uber Eats review> — the order card under the review */}
  ```
- **Retakes:** when an existing screenshot shows a screen the PR changed, keep the image. List it as needing a retake, with its `out` path from `screenshots/shots/*.mjs`.
- **New shots:** if the user wants a screenshot defined, add an entry to the matching `screenshots/shots/<section>.mjs`, copying the nearest existing shot. Never run `npm run shots` yourself. It drives a real organization's data, so the user runs it.

## Phase 6: Validate

From the repo root:

```bash
mint validate
mint broken-links
```

If `mint` is not installed, use `npx mint@latest validate` and `npx mint@latest broken-links`. Fix anything they report that the changes caused.

## Phase 7: Preview and hand over

Show the user:
- **Pages changed or added:** each with a one-line summary.
- **The diff:** `git diff --stat` and the changed text.
- **Screenshots:** new placeholders and existing images to retake.
- **Skipped changes:** what was left out of the docs and why, so nothing is silently dropped.

Do not commit, push or open a PR until the user says so. When they do:
- **Branch:** a `docs/<slug>` branch off `main`. Never commit on `main`.
- **Commit:** mention the source PR in the message, for example "Document order details in the inbox (Feedelity/feedelity#955)".
- **PR:** open it in `Feedelity/feedelity-help` with `gh pr create`, linking the source PR.

## Guardrails

- Document only what customers see at app.feedelity.io and in the Data Export API. Follow the content boundaries in `AGENTS.md`.
- Every label and behaviour is checked against the app code, never guessed from the PR text.
- Use "case", never "ticket", and the other terms in `AGENTS.md`.
- Don't fabricate screenshots, limits, plan names or platform rules. If the code doesn't settle it, ask.
- Don't rewrite unrelated parts of a page. Change what the PR changed and fix what it contradicted.
