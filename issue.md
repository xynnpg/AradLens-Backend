# AradLens Admin — Issue List

## Priority 0 — Functional blockers

- [ ] Verify the authentication flow end to end: login must proxy to `/auth/login`, preserve the API response, set the `aradlens_token` HttpOnly cookie, and load `/auth/me` successfully.
- [ ] Verify the proxy forwards `Authorization: Bearer <aradlens_token>` for `/auth/me`, `/admins`, and all administrator CRUD requests.
- [ ] Verify `GET /api/admins` never remains stuck on “Loading administrators…” and displays the returned JSON array.
- [ ] Verify the administrator list has explicit loading, success, empty, error, and retry states.
- [ ] Verify superadmin-only visibility is based on `/auth/me.role === "superadmin"` and is case-insensitive.
- [ ] Verify administrator Edit loads `GET /api/admins/:id`, fills the form, navigates to the Administrators tab, and focuses the editable field.
- [ ] Verify administrator Delete confirms the action, calls `DELETE /api/admins/:id`, and refreshes both administrator views.
- [ ] Verify administrator Create sends the API schema exactly: `username`, `email`, `password`, `role`, and `is_active`.
- [ ] Verify administrator Update sends only valid update fields: `email`, `password`, `role`, and `is_active`.
- [ ] Verify failed API requests show the actual API error and an actionable retry path.

## Priority 1 — Accessibility and readability

- [ ] Raise body and functional UI text to readable sizes: body around 14–15px, secondary text at least 12px, and no functional text below 11px.
- [ ] Fix all WCAG AA contrast failures, including muted text, lavender text, mint statuses, apricot statuses, table metadata, and disabled-looking controls.
- [ ] Ensure night-theme text and controls maintain WCAG AA contrast.
- [ ] Preserve visible keyboard focus for navigation, forms, buttons, filters, and dynamically generated administrator actions.
- [ ] Ensure all icon-only controls have accessible labels.
- [ ] Ensure the password reveal control has an accurate label and `aria-pressed` state.
- [ ] Ensure administrator forms have proper labels, required states, autocomplete values, and usable error announcements.
- [ ] Ensure loading and error status regions use `role="status"` or `role="alert"` appropriately.
- [ ] Verify responsive layouts at mobile, tablet, desktop, and zoomed states.
- [ ] Verify translated Romanian labels do not overflow or hide actions.

## Priority 1 — UI hierarchy and visual system

- [ ] Make the night theme feel like the AradLens industrial blueprint system, not a generic dark SaaS dashboard.
- [ ] Reserve saturated colors for incidents, warnings, and actions; make healthy/routine states calmer.
- [ ] Keep the deep plum rail, grid/linework, cartographic markers, and restrained plum signals consistent.
- [ ] Reduce decorative glow, radial halos, excessive gradients, and non-essential visual effects that compete with operational content.
- [ ] Review polygonal clipping and repeating stripes; keep only effects that support the blueprint world.
- [ ] Replace arbitrary color values with semantic design tokens where possible.
- [ ] Resolve typography drift between the committed single-humanist-sans guidance and the current font pairing.
- [ ] Remove or justify extreme negative letter spacing.
- [ ] Keep heading hierarchy clear without overusing eyebrow/kicker labels.
- [ ] Make routine health visibly calmer than active incidents.

## Priority 1 — Administrator UX

- [ ] Keep Administrators as a separate superadmin-only tab above Settings.
- [ ] Show administrator records in the Users tab for superadmins.
- [ ] Keep Edit and Delete actions directly visible on every administrator row.
- [ ] Add an explicit edit-state indicator showing which administrator is being edited.
- [ ] Add a visible Back to users action from the edit form.
- [ ] Add Refresh actions to administrator listings.
- [ ] Display API-backed administrator data rather than stale prototype rows.
- [ ] Refresh both administrator displays after create, update, and delete.
- [ ] Prevent duplicate event handlers or duplicated rows after repeated refreshes.
- [ ] Add protection and clear feedback for destructive actions.
- [ ] Clarify permissions so regular admins do not see or access superadmin controls.

## Priority 1 — Prototype/API truthfulness

- [ ] Clearly label prototype metrics and simulated dashboard values while the remaining API endpoints are not connected.
- [ ] Avoid presenting simulated “API response,” “All systems operational,” and user counts as authoritative production telemetry.
- [ ] Replace dead-end “available when the API is connected” messages with clear unavailable-state explanations and next actions.
- [ ] Add retry guidance for health, admin, and other API-backed sections.
- [ ] Show the API source/state for data that is live versus prototype-backed.

## Priority 2 — Layout and spacing

- [ ] Keep the sidebar at viewport height while the main content scrolls.
- [ ] Verify no positioned child is clipped by `body` or an ancestor overflow rule.
- [ ] Fix cramped padding in health summaries, health rings, health lists, and activity rows.
- [ ] Keep content groups separated with deliberate spacing rather than repeated arbitrary margins.
- [ ] Ensure page-heading actions wrap cleanly on narrow screens.
- [ ] Ensure administrator rows remain readable with long usernames and email addresses.
- [ ] Ensure tables and action groups do not overflow at narrow widths.
- [ ] Verify sticky navigation, mobile navigation, and scrim behavior.

## Priority 2 — Interaction and recovery

- [ ] Add hover, focus, active, disabled, loading, success, empty, and error states to all meaningful controls.
- [ ] Make API retry actions available without a full-page refresh.
- [ ] Preserve entered form values after recoverable API errors.
- [ ] Show a clear success message after administrator create/update/delete.
- [ ] Provide a safe cancel path from administrator editing.
- [ ] Ensure sign out clears the local authenticated state and server cookie.
- [ ] Ensure stale or expired tokens return users to the login screen cleanly.
- [ ] Verify Escape and keyboard navigation paths.

## Priority 2 — Browser and QA coverage

- [ ] Manually test login with `admin` / `administrare`.
- [ ] Inspect `POST /api/auth/login`, `GET /api/auth/me`, and `GET /api/admins` in browser Network tools.
- [ ] Confirm unrelated cookies such as `nutrition_session` are not forwarded to the API.
- [ ] Test administrator create, details, update, and delete against the live API.
- [ ] Test regular-admin permissions separately from superadmin permissions.
- [ ] Test day and night themes.
- [ ] Test English and Romanian localization.
- [ ] Test desktop, tablet, mobile, and keyboard-only interaction.
- [ ] Check browser console for errors and warnings.
- [ ] Run `npm run check` after code changes.
- [ ] Run the Impeccable detector against the current markup and document intentional remaining findings.

## Known detector findings from the prior review

The previous scan reported 101 findings:

- 100 warnings
- 1 advisory
- 16 low-contrast findings
- 15 tiny-text findings
- 49 undersized UI-text findings
- 4 cramped-padding findings
- 3 dark-glow findings
- 6 kicker-above-heading findings
- 2 organic-clip-path findings
- 1 repeating-stripes-gradient advisory
- 1 radial-halo finding
- 1 cream-palette finding
- 1 extreme-negative-tracking finding
- 1 clipped-overflow-container finding
- 1 overused-font finding

A later scan reduced the reported findings to approximately 55, but remaining findings must be rechecked against the rendered UI and either fixed or documented as intentional.

## Prior critique reports

### Dark-theme dual-agent critique

**Method:** dual-agent (A: `22c13b86-e62e-4298-b4f3-7fafd978fe24` · B: `75952198-f501-4eb1-bae3-eefbc35e72a9`)

The site works, but the night theme looks more like a generic dark SaaS dashboard than an AradLens industrial blueprint interface.

Main problems:

1. Text is too small.
2. Several colors fail contrast checks.
3. Too many bright accent colors compete for attention.
4. The night theme does not feel calm when everything is healthy.
5. Prototype/API data looks more authoritative than it should.

#### Design score

| Area | Score |
|---|---:|
| System status visibility | 3/4 |
| Real-world language | 3/4 |
| User control | 3/4 |
| Consistency | 2/4 |
| Error prevention | 2/4 |
| Recognition | 3/4 |
| Efficiency | 2/4 |
| Visual simplicity | 2/4 |
| Error recovery | 2/4 |
| Help/documentation | 2/4 |
| **Total** | **24/40** |

#### Detector results

- 101 findings
- 100 warnings
- 1 advisory
- 0 JavaScript errors
- 16 contrast issues
- 15 tiny-text issues
- 49 undersized UI-text issues
- 4 spacing issues
- 3 decorative glow issues
- 6 kicker-above-heading issues
- 1 overflow issue

The black/night theme rendered successfully in the browser.

#### Highest-priority design fixes

1. **Increase text size:** table labels, status badges, chart labels, metadata, helper text, and navigation counts. Recommended minimums: body 14px, secondary 12px, small labels 11px.
2. **Fix contrast:** lavender text, mint statuses, apricot statuses, muted labels, and table metadata.
3. **Improve night-theme hierarchy:** reserve bright colors for errors, warnings, and items requiring action; keep healthy/routine states quieter.
4. **Make administrator editing clearer:** show the selected administrator, an “Editing administrator” state, a “Back to users” action, and a success message after saving.
5. **Clarify prototype data:** labels such as “API response,” “All systems operational,” and numeric metrics should not look like authoritative production telemetry while prototype-backed.

#### Strong parts

- Arad-specific copy makes the product feel less generic.
- The navigation rail and page structure are easy to understand.
- Administrator rows expose Edit and Delete directly.
- The place-marker concept is distinctive and worth preserving.

#### Night-theme questions

- Should NIGHT be a true industrial blueprint mode instead of a dark recolor?
- What should be noticed first: incidents, editorial work, or system health?
- Should a healthy system look visibly calmer?
- Which data should be marked as prototype data?

Questions skipped: no source edits were requested during this critique pass.

### Earlier design critique

The AradLens admin UI has a clear industrial-plum identity and the main workspace structure is understandable. The strongest functional path is login → authenticated dashboard → superadmin administrator management.

#### Design health

| # | Heuristic | Score |
|---:|---|---:|
| 1 | Visibility of system status | 3/4 |
| 2 | Match with the real world | 3/4 |
| 3 | User control and freedom | 3/4 |
| 4 | Consistency and standards | 2/4 |
| 5 | Error prevention | 2/4 |
| 6 | Recognition over recall | 3/4 |
| 7 | Flexibility and efficiency | 3/4 |
| 8 | Minimalist design | 2/4 |
| 9 | Error recovery | 2/4 |
| 10 | Help and documentation | 2/4 |
| **Overall** |  | **25/40** |

#### Strengths

- The plum navigation rail creates a stable workspace anchor.
- Navigation hierarchy is easy to scan.
- Superadmin-only controls are appropriately separated from regular users.
- Administrator rows expose the important actions directly.
- Login and API loading states are visible.

#### Priority issues

1. **Typography is too small:** 15 tiny-text warnings and 49 undersized UI-text warnings; increase functional text to at least 12px and body text closer to 14px.
2. **Contrast failures:** 16 low-contrast combinations affect muted text, status labels, lavender text, and mint/peach surfaces.
3. **Administrator loading state is fragile:** null-safe handling prevents a crash, but loading and error states should use one shared status region instead of duplicated messages.
4. **Edit flow is indirect:** Edit starts from Users and navigates to Administrators; show the selected administrator, provide an edit-state banner, and add a visible Back to users action.
5. **Excessive decorative treatment:** glows, halos, gradients, polygon clipping, and repeating stripes can compete with operational content.

#### Detector results

- 101 findings
- 100 warnings
- 1 advisory
- 16 low-contrast findings
- 64 typography-size findings
- 5 layout/spacing findings
- 7 hierarchy/style findings
- 8 decorative-style findings

Browser inspection found no JavaScript console errors after the administrator-list fix.

#### Recommended polish pass

- Raise all functional text below 11px.
- Fix muted-text contrast tokens globally.
- Simplify the admin table into a more readable row structure.
- Add a clear edit-state banner.
- Replace generic text actions with consistent compact action buttons.
- Reduce decorative glow and clipping effects while preserving the plum/blueprint identity.
- Verify desktop, tablet, mobile, keyboard, loading, empty, error, and edit states.

Questions skipped: the requested command list combined critique, layout, and polish, but the next implementation priority was not specified.

## Manual browser test procedure

1. Start the site with `npm start`.
2. If port `4173` is already occupied, open the existing site instead of starting another server.
3. Sign in using `admin` / `administrare`.
4. Confirm `/api/auth/login` returns the API token response and the server sets `aradlens_token`.
5. Confirm `/api/auth/me` returns the authenticated admin and role.
6. For a superadmin, open Users and confirm administrator rows load.
7. Test Edit, Save, Cancel, Refresh, and Delete.
8. Open Administrators and verify the same records and form state.
9. Repeat relevant checks in night theme and at mobile width.
10. Record exact request URLs, status codes, response bodies, and console errors for failures.
