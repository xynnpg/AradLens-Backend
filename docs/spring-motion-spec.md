# AradLens spring motion specification

Status: implemented, 2026-10-27. This document does not change application code.

## 1. Decision

Use **four restrained, pre-sampled spring easings** for direct control feedback and the five existing Clay movements. Keep colour changes short and conventional. Do not add a runtime physics engine, dependency, build step, drag gesture, or animation loop.

The upgrade converts **13 motion surface groups**: shared buttons, secondary controls, point cards, card artwork, the switch thumb, page entry, dialogs, account menu, active nav tile, list rows, toasts, mobile navigation, and map zoom buttons. Everything else stays instant, native, colour-only, or owned by Leaflet.

The five Clay movements keep their existing geometry and stagger discipline. The useful expansion is tactile press/release feedback, the switch thumb, and reversible mobile navigation—not springs on every visual change.

## 2. What Apple actually recommends, filtered for this app

### Sourced facts

- [WWDC 2018, *Designing Fluid Interfaces*](https://developer.apple.com/videos/play/wwdc2018/803/) emphasizes immediate response, interruption/redirection, spatial consistency, and velocity continuity. It recommends starting with 100% damping/no overshoot and using bounce purposefully, especially when a gesture has momentum. A tap does not inherently justify a large bounce.
- [WWDC 2023, *Animate with springs*](https://developer.apple.com/videos/play/wwdc2023/10158/) explains that springs preserve position and velocity, including when retargeted; a spring need not bounce. It distinguishes perceptual duration from settling duration. Current SwiftUI APIs use duration/bounce, while `Spring` also exposes response/damping-ratio and mass/stiffness/damping conversions. `.smooth` has no bounce, `.snappy` a small amount, and `.bouncy` a higher amount. Apple recommends bounce 0 as the general-purpose starting point and cautions that values above roughly 0.4 can be exaggerated. The cited sources do **not** publish numeric parameters for those three presets, so this spec does not invent them.
- [Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion) says motion should be purposeful, brief, precise, optional, cancellable, and generally avoided on frequently repeated custom interactions. [Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) says Reduce Motion should reduce repetitive motion, zoom/scale/peripheral motion, and spring bounce, potentially replacing axis movement with fades.
- [MDN: `linear()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function/linear) interpolates piecewise-linearly between progress samples and permits values outside 0–1. It is therefore a no-dependency way to bake a spring curve into CSS. It is **not** a runtime spring and cannot preserve velocity from a gesture or an interrupted transition.
- [MDN: CSS transition performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance) notes that a reversed CSS transition starts from the current style rather than jumping to the old endpoint. [MDN: `Element.animate()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) provides playback control when JavaScript is genuinely needed.
- [W3C WCAG 2.2 SC 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) is an AAA criterion, but its guidance supports this app's stricter choice: non-essential interaction motion can be disabled through the user-agent reduced-motion preference.

### Engineering judgement for AradLens

This app has no app-owned direct-manipulation animation that needs initial velocity. Its only dragging is Leaflet's marker/map interaction, which remains native. Baked CSS springs are sufficient and simpler than WAAPI. Clay should feel responsive rather than playful: three tokens have no visible overshoot; the control token's maximum sampled overshoot is only 0.6288% of property travel (about 0.11px over the switch thumb's 17px travel).

## 3. Motion tokens

### Parameters and exact CSS

`response` below is the natural period used by this spec's unit-mass step-response model; it is not claimed to equal an Apple preset. `duration` is the finite CSS sampling window. The existing 120ms colour timing remains unchanged. Only the gentle token exceeds the old 220ms ceiling, and its extra 60ms is a nearly stationary tail.

| Token | Role | Response | Damping ratio ζ | CSS duration | Character |
|---|---|---:|---:|---:|---|
| `--spring-press` | button/control press and release | 160ms | 0.90 | 160ms | immediate, no sampled overshoot |
| `--spring-control` | switch thumb, nav tile, small control settling | 200ms | 0.85 | 200ms | tiny tactile overshoot, max 1.006288 |
| `--spring-surface` | card, dialog, menu, toast, mobile surface | 240ms | 0.90 | 240ms | smooth, no sampled overshoot |
| `--spring-gentle` | 8px page arrival | 240ms | 1.00 | 280ms | critically damped, no overshoot |
| `--ease-exit` | reversible exits only | n/a | n/a | 120ms | fast non-bouncy `cubic-bezier(.4,0,1,1)` |

Add fallback values first and replace them only where `linear()` is supported. This avoids an unsupported custom-property value invalidating a transition at computed-value time.

```css
:root {
  --dur-press:160ms;
  --dur-control:200ms;
  --dur-surface:240ms;
  --dur-gentle:280ms;
  --ease-exit:cubic-bezier(.4,0,1,1);

  /* Graceful fallback: calm ease-out, never a fake bounce. */
  --spring-press:cubic-bezier(.2,.8,.2,1);
  --spring-control:cubic-bezier(.2,.8,.2,1);
  --spring-surface:cubic-bezier(.2,.8,.2,1);
  --spring-gentle:cubic-bezier(.2,.8,.2,1);
}

@supports (transition-timing-function:linear(0,1)) {
  :root {
    --spring-press:linear(0, 0.040901, 0.135847, 0.254396, 0.377489, 0.493961, 0.597963, 0.687105, 0.761139, 0.821057, 0.868474, 0.905245, 0.933219, 0.954104, 0.969399, 0.980377, 0.98808, 0.993347, 0.996837, 0.999056, 1);
    --spring-control:linear(0, 0.041292, 0.13821, 0.260386, 0.388102, 0.50938, 0.617685, 0.710171, 0.786369, 0.84724, 0.894509, 0.93022, 0.956447, 0.975124, 0.98796, 0.996398, 1.001617, 1.004554, 1.00593, 1.006288, 1);
    --spring-surface:linear(0, 0.040901, 0.135847, 0.254396, 0.377489, 0.493961, 0.597963, 0.687105, 0.761139, 0.821057, 0.868474, 0.905245, 0.933219, 0.954104, 0.969399, 0.980377, 0.98808, 0.993347, 0.996837, 0.999056, 1);
    --spring-gentle:linear(0, 0.052807, 0.167367, 0.300809, 0.430757, 0.546791, 0.645214, 0.725908, 0.790486, 0.841241, 0.880575, 0.910718, 0.933607, 0.950855, 0.96377, 0.973386, 0.980512, 0.985771, 0.989637, 0.992471, 1);
  }
}
```

The press and surface curves have the same normalized samples intentionally; their different durations and roles still matter. Do not replace these semantic names with one global curve.

### Reproduction/math check

For zero initial velocity, unit target, `ω = 2π / response`, and time `t`:

```text
underdamped (0 < ζ < 1):
  ωd = ω √(1 - ζ²)
  x(t) = 1 - e^(-ζωt) [cos(ωdt) + (ζω/ωd) sin(ωdt)]

critically damped (ζ = 1):
  x(t) = 1 - (1 + ωt)e^(-ωt)
```

Each `linear()` contains 21 values sampled at `t = i × duration / 20`, `i = 0…20`; omitted percentages therefore mean 5% intervals. The final sample is pinned to exactly 1. Before pinning, the largest absolute residual is 0.6020% of travel (control); all others are at most 0.5459%. This is smaller than one pixel at the specified travel distances, not an invented physics parameter.

## 4. Component specification

“Colour 120” below means the existing `var(--dur-1) ease-out` on `background-color`, `border-color`, and/or `color` only. No `transition:all`.

| Surface / state | Current behaviour and references | Required behaviour | Properties / token | Reason |
|---|---|---|---|---|
| `.button`, including `label.button` and capture-page buttons | Hover lifts 2px (`styles.css:501-503`, `2011-2013`); final press scales `.975` over 100ms (`3360-3367`); legacy `translateY(1px)` at `1828-1830` also affects nav/icon controls | **Convert.** Remove button hover lift. Keep immediate colour hover. Press scales `.975`; release returns to rest. Exclude `:disabled`. | Colour 120 + `transform var(--dur-press) var(--spring-press)` | Direct tactile feedback without perpetual movement on a frequent control. |
| `.icon-button`, `.nav-item`, `.text-button`, `.more-button`, `button.filter-button`, `.queue-item`, `.account-menu button`, `.account-button` | Colour-only final rule `styles.css:3369-3379`, account button `5207`; nav/icon press translates 1px at `1828-1830` | **Convert.** Add press scale `.98` (`.99` for full-width `.queue-item`). Keep existing colour transitions and nav-entry animation. No hover translation. | Colour 120 + `transform var(--dur-press) var(--spring-press)` | Consistent feedback with less text movement than the 2.5% primary-button press. |
| Additional controls: `.theme-toggle`, `.mobile-menu`, `.card-open`, `.text-action`, `.category-action`, `.tour-pool-item`, `.tour-stop-action`, `.image-thumb-select`, `.image-thumb-delete`, `.capture-remove`, `.toast-dismiss` | Mostly colour-only or instant. `.card-open:hover` moves -2px in `index.html:75`; category colour at `styles.css:2722`; toast dismiss colour at `5097` | **Add/convert press only.** Scale `.98` while active; disabled tour controls never move. Remove `.card-open` hover translation. Preserve all existing focus/selected styles. | `transform var(--dur-press) var(--spring-press)`; existing Colour 120 where present | Brings secondary controls into the same family without adding ornamental hover motion. |
| `.password-toggle` | Centreing depends on `transform:translateY(-50%)`, `styles.css:460-465` | **Add carefully, not through the generic rule.** Active value must be `translateY(-50%) scale(.98)`. | Same press token, with translate preserved | Prevents losing vertical centreing. |
| `.point-card` hover | -2px plus shadow, final winning rule `styles.css:3380-3385`; older -4px rule `1122-1132` is overridden | **Convert.** Keep -2px lift. Replace animated shadow with `border-color:var(--border-strong)` and `box-shadow:none`. Article itself gets no `:active` state; only `.card-open` presses. | `transform var(--dur-surface) var(--spring-surface)` + border Colour 120 | Maintains lift while respecting Clay's “shadow only for overlays” and avoiding shadow repaints. |
| `.point-card:hover .point-drawing` | Art moves another -2px and fades in, `styles.css:2279-2283` | **Simplify.** Keep opacity change; remove independent drawing translation so card and art do not travel a combined 4px. | `opacity var(--dur-1) ease-out` | Decorative art should not create a second movement. |
| `.toggle`, `.toggle:after` | Track colour 180ms and thumb translation 180ms, `styles.css:1375-1400` | **Convert thumb only.** Track remains colour-only. Keep exact `translateX(17px)` end state and instantaneous checked state semantics. | Track Colour 120; thumb `transform var(--dur-control) var(--spring-control)` | A small, stateful control benefits most from physical continuity. |
| `.page.active-page` | 8px fade-up, 220ms `--ease`, `styles.css:4990-4993`, `5015-5017` | **Convert curve only.** Same keyframes, no scale, no exit animation, no delay. | `page-arrive var(--dur-gentle) var(--spring-gentle) backwards` | Preserves the first sanctioned Clay movement. |
| `.modal:not(.is-hidden) .modal-backdrop` and `.modal-panel` | Veil fades 160ms; panel rises 12px from `.985`, 220ms, `styles.css:4994-5001`, `5018-5023` | **Convert panel only.** Veil uses ordinary `160ms ease-out`; panel keeps identical keyframes with surface spring. Closing stays immediate because `.is-hidden` sets `display:none`. | Veil opacity 160 ease-out; panel `dialog-arrive var(--dur-surface) var(--spring-surface) backwards` | Opacity is not a physical position and does not need a spring. No JS exit lifecycle is worth adding. |
| `.account-menu:not(.is-hidden)` | 6px fade/down entry, 160ms, `styles.css:5002-5005`, `5024-5027`; duplicate selector is redundant | **Convert curve only.** Same geometry. Closing remains immediate. Remove the duplicated selector when editing that block, without changing behaviour. | `menu-drop var(--dur-surface) var(--spring-surface) backwards` | Second sanctioned movement; no new exit system. |
| `.nav-item.is-active` | Opacity `.55` and scale `.96` to rest, 160ms, `styles.css:5006-5009`, `5028-5030` | **Convert curve only.** Keep active fill/colour and existing `aria-current`; press rule applies after entry. | `tile-settle var(--dur-control) var(--spring-control) backwards` | Third sanctioned movement; scale is state feedback, not motion-only meaning. |
| `.admin-list>*`, `#users-admins-list>.user-row` | 5px row arrival, 40ms stagger, all rows after fourth capped at 160ms, `styles.css:5010-5013`, `5031-5044` | **Convert curve only.** Keep selector scope, keyframes, 40ms intervals and cap. Do not stagger filtering, searches, or other lists. | `row-arrive var(--dur-control) var(--spring-control) backwards` | Fifth sanctioned movement with unchanged total choreography. |
| `.toast` / `.toast.is-visible` | Opacity + 10px/`.985` entry and exit use same 160ms `--ease`, `styles.css:5052-5068`; JS toggles class and 7s timer at `app.js:722-735` | **Convert with asymmetric timing.** Base/hidden state uses 120ms exit ease; visible state uses 160ms opacity ease-out + surface spring transform. Do not change timer or live region. | Entry transform surface; exit `120ms var(--ease-exit)`; opacity conventional | Toast can reverse naturally in CSS; dismissals must not bounce. |
| Mobile `.sidebar`, `.sidebar-scrim` at ≤760px | `left` animates 200ms; scrim opacity 200ms, `styles.css:1512-1535`; final sidebar override `3939-3953` wins for sidebar | **Convert.** Final mobile rule sets `left:0`, closed `transform:translateX(-100%)`, open `transform:none`. Base/closed uses 120ms exit ease; open uses surface spring. Scrim opacity only. | Sidebar transform surface enter / exit ease; scrim opacity 160 enter / 120 exit | Removes layout-driven `left` animation and supports clean reversal. |
| `.leaflet-bar a` zoom buttons | Native Leaflet controls; night colours at `styles.css:3438-3445` | **Add press only** to the anchors: scale `.96` with press token. Do not touch their containing map panes or any other Leaflet selector. | `transform var(--dur-press) var(--spring-press)` | Buttons can be tactile without changing map physics. |
| Desktop `body.nav-collapsed` | Width, flex basis, padding, label `display` change instantly in `index.html:77-91`; state set at `app.js:3402-3418` | **Keep instant.** No width/flex/label animation and no FLIP. | None | Layout animation would cause reflow and noisy label movement. |
| Auth tabs and Settings `.segmented` | Selected fill/text and forms change; `app.js:798-807`; `styles.css:2898-2921`, `4760-4787` | **Auth tabs stay instant.** Settings `.segmented` is a later deliberate exception to "segmented stays instant": a `::before` thumb slides behind the options with `--spring-control` under `@supports selector(:has(*))`, with the filled active button as the fallback. Buttons never press-scale. | Thumb `transform var(--dur-control) var(--spring-control)`; buttons keep Colour 120 | The sliding thumb marks the chosen theme; it is the one segmented control that moves. |
| Theme toggles, language pickers, search/focus | Theme changes global tokens and icon `display`, `app.js:552-561`, `778-787`; native selects and search filtering remain native | **Keep theme/filter changes instant.** Buttons get the shared press only. No whole-page crossfade, select spring, search spring, or focus-ring animation. | Press on button only; focus stays instant | Large palette motion is distracting; native controls should retain platform behaviour. |
| Tables, attention, tours, categories, invite/admin lists | Text/status updates and `hidden`/class changes; only admin/user-list entry currently animates | **Keep updates, deletion, filtering, reorder, edit mode, counts and health values instant.** Do not add row FLIP, count rolls, deletion collapse, or status pulses. | None beyond existing list-entry scope | Operational data should not perform on every refresh. |
| Image dropzone/gallery/previews | Dropzone border/background 120ms at `index.html:64`; uploading/dragover states at `67-69`; thumbnail state changes in `app.js:2244-2283`, `2407-2446` | **Keep dropzone colour-only and previews instant.** Only actual thumbnail/remove buttons get shared press. No spring on upload opacity, dragover, image load, or gallery reflow. | Existing Colour 120; no new surface motion | Upload progress and content layout are not spring targets. |
| Capture page states | Coordinate, photo, loading, invalid and done states change in `capture.html:164-179`, `182-230`, `232-273` | **Keep state changes instant.** Shared `.button` and new `.capture-remove` press apply. No GPS spinner, photo preview zoom, success bounce, or progress spring. | Press only | Status text and existing visual state carry meaning without motion. |
| Legal pages | Link colour transitions at `legal.css:44`, `52`; no transform motion | **Keep as-is.** Do not spring links. Add the same final reduced-motion kill switch to `legal.css` because legal pages do not load `styles.css`. | Colour only; reduced motion none | Static reading pages need no spring system. |

### Press, hover, and focus limits

- Press begins with zero delay. Only `.button` uses `.975`; compact/text controls use `.98`, queue rows `.99`, map zoom buttons `.96`. Never animate text size, weight, letter spacing, padding, border width, or layout.
- Use `transform-origin:center` unless an existing component already establishes one. Do not scale a card on press. Hover lift remains only on `.point-card`, at -2px.
- Gate every press rule with `:not(:disabled)` where the element can be disabled. Preserve the existing 2px focus ring and 2px offset; focus itself never springs.
- State is always available through label, fill, icon, `aria-pressed`, `aria-selected`, `aria-current`, or checked state. Motion is never the only signal.

## 5. Enter, exit, and interruption

### Recommended CSS-only approach

Use CSS transitions for reversible state changes and CSS keyframes for the existing entry-only movements. A transition retargets from the current computed value, so hover, press, toggle, toast, and mobile-navigation reversals have position continuity. They do **not** preserve the previous velocity when a baked `linear()` curve restarts; that limitation is acceptable here because none is a dragged object.

For toast-style asymmetric timing, put exit timing on the base state and entry timing on `.is-visible`:

```css
.toast {
  transition:opacity 120ms var(--ease-exit), transform 120ms var(--ease-exit);
}
.toast.is-visible {
  transition:opacity 160ms ease-out,
             transform var(--dur-surface) var(--spring-surface);
}
```

For mobile navigation, put the same base/open timing split on `.sidebar` and `.sidebar.is-open`. This automatically handles a close during opening from the current transform.

Dialogs and account menu currently disappear through `display:none` (`.is-hidden`, `styles.css:122-124`). **Keep their exits instant.** Do not add close timers, `transitionend` dependencies, `is-closing` states, or discrete-display browser dependencies solely to animate an exit. Instant is preferable to a bounced or delayed dismissal. If a future product requirement adds modal exits, that is the first point at which a small, carefully cancellable JS/WAAPI lifecycle is justified.

### When WAAPI would be justified

Use `element.animate()` only for a future app-owned direct-manipulation surface that must carry pointer velocity into a spring, or for a genuinely required interruptible exit that CSS cannot represent. It would then need cancellation/replacement of prior animations, reduced-motion checks, and final-state cleanup. None of those requirements exists in the current app, so WAAPI is explicitly out of this implementation pass.

## 6. Explicit “do not spring” list

- Login grid and orbs: indefinite ambient loops at `styles.css:3912-3917`; grid is already still at `3907-3911`. Keep exactly as they are.
- Any indefinite spinner, skeleton shimmer, ambient pulse, loading label, session-restoring state, upload state, progress bar, health ring, or auto-refresh indicator. Indefinite motion has no resting target and is not a spring use case.
- Map tiles, pan, zoom, marker placement/dragging, fit bounds, popup fade, and all vendor animation in `assets/vendor/leaflet/leaflet.css:177-207`. `app.js:1100-1114` already uses `animate:false` for picker view changes.
- Whole-theme transitions, language changes, native select popups, text caret, native checkboxes, validation messages, focus rings, and scrolling. Keep `html` smooth scrolling as-is; the reduced-motion rule already forces `auto`.
- Number changes, status badges, API health updates, notification dots, live counts, search filtering, grid/list view switching, tour reorder, category edit mode, image preview loading, and deletion/reflow.
- Desktop sidebar width collapse, page exits, modal/menu exits, and any layout property (`left`, `width`, `height`, `top`, `padding`, `flex-basis`). Mobile sidebar is the one conversion from layout animation to transform.
- Colour and opacity changes merely because a spring exists. Springs describe a response curve, not a requirement to animate every property.
- Exit/dismissal overshoot of any kind.

## 7. Performance and rendering

- Animate only `transform` and `opacity` for movement. Existing small-control colour transitions may remain; do not add animated `filter`, gradient, `box-shadow`, `clip-path`, or layout properties.
- Transform/opacity are compositor-eligible, not a guarantee of compositing. Test on a phone rather than adding blanket layer hints.
- Add **no** `will-change` in this pass. If profiling exposes a specific issue, apply it only immediately around that animation and remove it afterward, consistent with [MDN's warning against premature/overused `will-change`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change). Do not alter Leaflet's own hint at `leaflet.css:193-195`.
- Remove the card's animated `box-shadow`; use its existing hairline border for hover emphasis. Static overlay shadows on menus, modals, and toasts remain untouched.
- The 21-sample easing is evaluated by the browser as a normal easing function; there is no per-frame JavaScript, physics integration, allocation, or package cost.

## 8. Reduced motion and accessibility

The authoritative rule is `styles.css:5366-5373`: last in the stylesheet, `animation:none !important`, `transition:none !important`, and `scroll-behavior:auto !important`. Keep it last after every new motion declaration.

For this app, reduced motion means **instant final state**, not a slower spring and not a newly introduced fade. Entry keyframes and ambient loops disappear; toggle/sidebar/toast states change instantly. Extend the reduced-motion state cleanup so hover/press transforms do not even apply instantaneously (except transforms required to represent a functional state, such as the off-canvas sidebar or checked thumb):

```css
@media (prefers-reduced-motion:reduce) {
  .button:active,
  .icon-button:active,
  .nav-item:active,
  .text-button:active,
  .more-button:active,
  .filter-button:active,
  .queue-item:active,
  .account-button:active,
  .account-menu button:active,
  .theme-toggle:active,
  .mobile-menu:active,
  .card-open:active,
  .card-open:hover,
  .text-action:active,
  .category-action:active,
  .tour-pool-item:active,
  .tour-stop-action:active,
  .image-thumb-select:active,
  .image-thumb-delete:active,
  .capture-remove:active,
  .toast-dismiss:active,
  .point-card:hover,
  .point-card:hover .point-drawing,
  .leaflet-bar a:active {
    transform:none !important;
  }
  /* The existing universal animation/transition kill switch remains below. */
}
```

The password toggle needs its functional centreing preserved under reduced motion; if it receives the press rule, use `transform:translateY(-50%) !important` there rather than `none`. Do not globally clear all transforms: that would bring the closed mobile sidebar back on screen and misplace the switch thumb/password control.

Add an equivalent universal reduced-motion block at the end of `legal.css`. Capture loads `styles.css`, so its inline normal-priority styles cannot defeat the existing `!important` kill switch.

## 9. Browser support and fallback

- CSS `linear()` shipped in Chrome/Edge 113 ([Chrome 113 announcement](https://developer.chrome.com/blog/chrome-113-beta)), Firefox 112 ([Firefox developer release notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/112)), and Safari/iOS 17.2 ([WebKit 17.2 announcement](https://webkit.org/blog/14787/webkit-features-in-safari-17-2/)). This covers current Chrome, Firefox, Safari, and iOS Safari.
- Older browsers use `cubic-bezier(.2,.8,.2,1)` for all four tokens. Timing, geometry, state, focus, and reduced-motion behaviour remain identical; only the easing loses its spring tail/overshoot.
- WAAPI support is irrelevant to this CSS-only implementation. Do not add a support polyfill.

## 10. Exhaustive current-motion ledger

Line numbers refer to the current repository state. “Overridden” means a later equal/higher-priority declaration supplies the winning shorthand today; do not accidentally revive an older rule while editing.

### `styles.css`: every `transition:`, `animation:`, and `@keyframes`

| Lines | Current declaration | Winning/current status | Classification / implementation action |
|---|---|---|---|
| 148 | `.login-illustration:after { animation:login-grid-drift 22s linear infinite }` | Overridden by 3910 | **Keep off**; no spring. |
| 156 | `.login-grid-orb { animation:login-orb-float 10s ease-in-out infinite }` | Overridden by 3913 | **Keep ambient** with later 22s declaration; no spring. |
| 164 | `.login-grid-orb:after { animation:login-orb-spin 18s linear infinite }` | Overridden by 3916 | **Keep ambient** with later 60s declaration; no spring. |
| 183 | `.sky-orb { transition:opacity .25s ease-out,transform .25s ease-out }` | Active shorthand, but sun/moon switch through `display:none` at 1913-1918 | **Remove as dead motion**; theme illustration remains instant. |
| 499 | `.button { transition:transform .18s,box-shadow .18s,background .18s }` | Overridden by 1998, then 3361-3364 | **Legacy; no independent edit needed.** Final button rule is the conversion point. |
| 1127 | `.point-card { transition:transform .18s,box-shadow .18s }` | Overridden by 3381 | **Legacy; no independent edit needed.** Final card rule is conversion point. |
| 1382 | `.toggle { transition:background .18s }` | Active | **Convert to background-color 120 ease-out.** |
| 1394 | `.toggle:after { transition:transform .18s }` | Active | **Convert to control spring 200.** |
| 1520 | Mobile `.sidebar-scrim { transition:opacity .2s }` | Active | **Convert to 160ms opacity enter / 120ms exit ease.** |
| 1532 | Mobile `.sidebar { transition:left .2s }` | Overridden by 3949 | **Legacy; final mobile rule becomes transform spring.** |
| 1684-1691 | `@keyframes login-grid-drift` | No longer referenced after 3910 | **Keep or remove as cleanup; never spring.** Behaviour unchanged either way. |
| 1692-1699 | `@keyframes login-orb-float` | Used by 3913 | **Keep ambient.** |
| 1700-1704 | `@keyframes login-orb-spin` | Used by 3916 | **Keep ambient.** |
| 1705-1711, especially 1708-1709 | Early reduced-motion `transition:none; animation:none` | Later normal declarations can re-enable motion; final 5366 block is authoritative | **Keep as redundant defence or consolidate; final block must remain.** |
| 1796 | `.toast { transition:opacity .18s,transform .18s }` | Overridden by 5064 | **Legacy; final toast rule gets asymmetric spring/exit.** |
| 1998 | `.button { transition:transform 80ms step-end,background 80ms step-end }` | Overridden by 3361-3364 | **Legacy; do not restore step-end.** |
| 2279 | `.point-drawing { transition:transform .18s ease-out,opacity .18s ease-out }` | Active | **Remove transform transition/state; keep opacity 120.** |
| 2722 | `.category-action { transition:border-color/color var(--dur-1) ease-out }` | Active | **Keep colour; add transform press separately.** |
| 3361-3364 | Final `.button` colour + 100ms transform transition | Active/wins over 499 and 1998 | **Convert transform to press spring 160; retain colour 120.** |
| 3376-3378 | Shared secondary-control colour transition | Active | **Keep colour; add press transform 160.** |
| 3381 | Final `.point-card` transform + shadow transition | Active/wins over 1127 | **Convert transform to surface spring 240; replace shadow with border colour.** |
| 3418-3430 | Earlier reduced-motion duration `.01ms`, card hover reset | Superseded in practice by final `!important` block; card reset remains relevant | **Keep card reset/consolidate into final state cleanup; final block wins.** |
| 3910 | `.login-illustration:after { animation:none }` | Active/wins over 148 | **Keep off.** |
| 3913 | `.login-grid-orb { animation:login-orb-float 22s ease-in-out infinite }` | Active/wins over 156 | **Keep ambient; no spring.** |
| 3916 | `.login-grid-orb:after { animation:login-orb-spin 60s linear infinite }` | Active/wins over 164 | **Keep ambient; no spring.** |
| 3949 | Final mobile `.sidebar { transition:left .2s ease-out }` | Active/wins over 1532 | **Replace with transform entry/exit timing; set final `left:0`.** |
| 4990-4993 | `@keyframes page-arrive` | Active | **Keep geometry; apply gentle spring at 5016.** |
| 4994-4997 | `@keyframes veil-in` | Active | **Keep opacity geometry; use ordinary ease-out at 5019.** |
| 4998-5001 | `@keyframes dialog-arrive` | Active | **Keep geometry; apply surface spring at 5022.** |
| 5002-5005 | `@keyframes menu-drop` | Active | **Keep geometry; apply surface spring at 5026.** |
| 5006-5009 | `@keyframes tile-settle` | Active | **Keep geometry; apply control spring at 5029.** |
| 5010-5013 | `@keyframes row-arrive` | Active | **Keep geometry/stagger; apply control spring at 5033.** |
| 5016 | `animation:page-arrive var(--dur-3) var(--ease) backwards` | Active | **Convert to `var(--dur-gentle) var(--spring-gentle)`.** |
| 5019 | `animation:veil-in var(--dur-2) var(--ease) backwards` | Active | **Convert to `160ms ease-out`; no spring.** |
| 5022 | `animation:dialog-arrive var(--dur-3) var(--ease) backwards` | Active | **Convert to surface spring 240.** |
| 5024-5027 | Duplicate account-menu selector, `animation:menu-drop ...` | Active; duplicated selector has no extra effect | **Convert to surface spring 240 and deduplicate selector.** |
| 5029 | `animation:tile-settle var(--dur-2) var(--ease) backwards` | Active | **Convert to control spring 200.** |
| 5033 | `animation:row-arrive var(--dur-2) var(--ease) backwards` | Active; delays at 5035-5044 stay | **Convert to control spring 200.** |
| 5064 | Final toast opacity/transform `--ease` transition | Active/wins over 1796 | **Convert to base exit 120 and visible surface entry 240.** |
| 5097 | Toast dismiss opacity/background 120 ease-out | Active | **Keep colour; add press transform separately.** |
| 5207 | Account button background 120 ease-out | Active | **Keep colour; add press transform separately.** |
| 5366-5373, especially 5370-5371 | Final reduced-motion `animation:none !important; transition:none !important` | Authoritative/wins over all earlier motion | **Keep last and unchanged; add state transform cleanup before/within this media block.** |

### Inline, JavaScript, vendor, and other production motion

| File/lines | Current declaration or state mechanism | Classification / action |
|---|---|---|
| `index.html:64` | `.image-dropzone` border/background 120ms | **Keep colour-only.** No spring on drag/upload. |
| `index.html:75` | `.card-open:hover` transform -2px without transition | **Remove hover translation; add press spring.** |
| `index.html:47-50`, `378-387` | Modal geometry and nine modal instances | **Keep geometry; shared entry spring, instant exit.** |
| `index.html:77-91`; `app.js:3402-3418` | Desktop sidebar collapse | **Keep instant; no width spring.** |
| `index.html:100-105`; `app.js:3216-3305`, `3333-3355` | Account menu open/close | **Entry spring only; close instant; ARIA unchanged.** |
| `app.js:552-561`, `778-787` | Theme icon `display`, theme/language changes | **Keep instant; no JS animation.** |
| `app.js:672-696` | Page and active nav class changes | **CSS-only conversion; no JS change needed.** |
| `app.js:722-735` | Toast class and 7-second dismissal | **CSS-only conversion; timer/live region unchanged.** |
| `app.js:798-807` | Auth tab form/selected state | **Keep form switch instant.** |
| `app.js:858-873` | Mobile navigation class changes | **CSS-only transform conversion; ARIA unchanged.** |
| `app.js:898`, `1114`, `2099-2109` | `requestAnimationFrame` for focus/map layout | **Keep; these are not motion loops and need no spring.** |
| `app.js:1020-1029`, `1209-1224` | Search/filter `hidden` changes | **Keep instant.** |
| `app.js:1736-1761` | Point-card creation | **CSS-only conversion; markup unchanged.** |
| `app.js:2244-2283`, `2407-2446` | Gallery/upload/drag states | **Keep state changes instant/colour-only.** |
| `app.js:2687-2751` | Tour add/reorder/remove controls | **Press on actual buttons only; no reorder motion.** |
| `app.js:2990-3007`, `3010-3151` | Queue, attention, latest-location rendering | **No new list motion.** |
| `capture.html:13-44` | Inline component CSS; no transition/animation declarations | **No new surface motion; shared buttons still apply.** |
| `capture.html:164-230`, `232-273` | Loading/GPS/photo/submit/done state changes | **Keep instant; no success/progress spring.** |
| `legal.css:44`, `52` | Link colour transitions | **Keep; add reduced-motion block at file end.** |
| `assets/vendor/leaflet/leaflet.css:181-183` | Popup opacity 200ms linear | **Keep vendor-owned; no spring.** |
| `assets/vendor/leaflet/leaflet.css:193-206` | Map zoom transform 250ms, tile transitions disabled | **Keep vendor-owned; do not override.** |
| All `app.js` / `capture.html` | No `Element.animate()`, no app-owned rAF physics loop, no inline transition/animation | **No JS animation conversion required.** |
| `docs/design-overview.html:111` | Design reference button transition, not an app entry point | **Out of production scope; do not use it to override app decisions.** |

After conversion, re-run a search for `transition:`, `animation:`, and `--ease`. Retire the now-unused `--ease` only if no production reference remains; do not remove duration tokens merely for tidiness in this pass.

## 11. Acceptance criteria

1. **Computed tokens:** In a `linear()` browser, each spring token computes to the exact corresponding `linear(...)` above. With support deliberately disabled, it computes to `cubic-bezier(.2,.8,.2,1)` and every interaction still works.
2. **No broad transitions:** No new `transition:all`, `transition-property:left/width/height/box-shadow/filter`, animated text metrics, or permanent `will-change` exists. `.point-card` no longer transitions `box-shadow`; mobile `.sidebar` no longer transitions `left`.
3. **Correct roles:** Buttons/compact controls use press 160; switch/nav/list use control 200; cards/dialog/menu/toast/mobile sidebar use surface 240; page arrival uses gentle 280. Backdrop and colour changes do not use a spring.
4. **Geometry preserved:** Page still starts 8px down, dialog 12px down at `.985`, menu -6px, nav `.96`, list rows 5px with 40ms/capped stagger, card hover -2px, switch thumb 17px. No extra drawing translation remains.
5. **Press discipline:** Primary buttons reach `.975` only while active; disabled controls never press; password toggle remains vertically centred; card articles do not scale on press. Text remains readable at every sampled frame.
6. **No layout shift:** Hovering/pressing any control or card does not change siblings' `getBoundingClientRect()` values, document scroll width, focus order, or hit target geometry. Visual overlap from the existing 2px lift is acceptable.
7. **Exit behaviour:** Toast and mobile-sidebar dismissal use 120ms `--ease-exit` with no output above 1. Modal/account-menu dismissal remains immediate. No close timer or delayed focus restoration is introduced.
8. **Interruption:** Rapidly press/release, toggle repeatedly, show/dismiss toast, and open/close mobile navigation mid-transition. The current rendered position is retained with no jump to an old endpoint and no queued animation.
9. **Reduced motion:** With `prefers-reduced-motion:reduce`, computed `animation-name` is `none` and transition durations are `0s` on every app surface, including ambient orbs and capture. Page/dialog/menu/nav/list render directly in final state; hover/press transforms are suppressed; functional states still appear correctly. Legal pages also have no transitions.
10. **Accessibility:** Existing focus indicator remains visible at 2px/2px offset; keyboard activation, Escape, focus restoration, `aria-expanded`, `aria-pressed`, `aria-selected`, `aria-current`, live-region text, and all state labels are unchanged. Run the existing day/night WCAG AA contrast pass with no contrast regressions.
11. **Performance:** Profile card hover, dialog open, toast, and mobile navigation on a phone: no animated shadow/filter/layout, no per-frame JS, no new layers hinted globally, and no visible jank. Map dragging/zoom performance and vendor timing are unchanged.
12. **Regression checks:** Exercise all nine modals, account menu, theme/language controls, auth tabs, search/filter, grid/list switch, admin/tour/category controls, image upload/gallery, capture flow, and map picker. `npm run check` passes and `package.json` gains no dependencies or build step.

## 12. Implementation risks / open questions

- **Cascade risk:** `styles.css` contains several legacy winning/losing declarations. Implement at the final winning rules identified above (or remove legacy rules deliberately), then inspect computed styles rather than assuming source order.
- **Spring limitation:** Baked `linear()` cannot carry interruption velocity. This is accepted for tap/state transitions; do not claim true Apple-style velocity preservation. A future draggable app-owned surface would require a separate WAAPI/physics design.
- **Exit scope:** Modal/menu exits remain instant by design. If design later insists on visible exits, treat that as a separate accessibility-reviewed JS lifecycle task rather than slipping timers into this pass.
- **Documentation sync:** After implementation, update `DESIGN.md` and `docs/theming-and-language.md` so “one curve” and the motion-token inventory describe the semantic spring set. This specification intentionally makes no such edits now.
