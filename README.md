# Sensos — Ops Intelligence Demo

Clickable HTML wireframe for the Sensos PM case study presentation.

## How to run

**Locally:** Open `index.html` in any modern browser. No server, no build step.

**GitHub Pages:**
1. Push this `demo/` folder to a GitHub repo (as the root, or a subfolder)
2. In repo Settings → Pages, set source to the branch + folder containing `index.html`
3. Share the Pages URL with the team

## Screens

| Screen | How to reach |
|---|---|
| **Title** | Opens on load. Click anywhere to enter. |
| **Overview** | After title, or click Overview in sidebar. Two-state dashboard: "Live shipments" (summary — at-risk list + updates feed + "View all" link + animated map dots) and "Lane status" (per-lane COP, carrier type, failure rate, out-of-rules + action buttons + heatmap). |
| **Shipments** | Click Shipments in sidebar, or "View all shipments" from Overview. Full list of live + delivered shipments. Filter: All / Live / Delivered. |
| **Shipment Detail** | Click any shipment row. Breadcrumb: Shipments / Lane / ID. Shows header stats, journey pipeline (current stage highlighted), per-shipment activity timeline, and a floating command bar. |
| **Manage lanes** | Click Lanes in sidebar. Config view: per-lane Configure button (toast) + "Add lane" button (toast). |
| **Lane Detail** | Click any lane row. Breadcrumb: Overview / Lanes / Name. Shows a lane metrics strip (CPO, failure %, out-of-rules %, avg transit) + journey pipeline. Every stage node is clickable: expands to show CPO at that leg, excursion rate, carrier/handoff, and any active shipments at that stage. |
| **Level 2 expansion** | Click "Expand" on any activity row. |
| **Level 3 trace** | Click "See full trace" inside a Level 2 expansion. |
| **Agents** | Click Agents in sidebar. Org-chart view (Ops Lead → SI/OA → RA/PA). Click a card for detail panel. |
| **Products** | Click Products in sidebar. |
| **Product Detail** | Click any product row. |

## Presentation controls

A small presenter bar appears in the top-right corner on non-title screens:

- **Quiet / Exception toggle** — switches between the quiet state (no exceptions) and the active state (one exception on Miami-NYC requiring a decision).
- **Simulate agent** — fires a popup card from an agent. Click multiple times for different scenarios.
- **Restart** — returns to the title screen and resets all state (scenario resets to Quiet).

## Command bar

A floating input bar hovers near the bottom of the Lane Detail and Shipment Detail screens. Type a command and press Enter (or the arrow button) to trigger a canned agent acknowledgement popup. Demo only — not connected to anything.

**Recommended walkthrough order:**
1. Title screen → click in
2. Overview — "Live shipments" tab (default): fleet strip, summary (at-risk count + "View all"), updates feed, animated dots on map
3. Click an at-risk shipment in the summary → Shipment Detail (breadcrumb: Shipments / Miami-NYC / #4471)
4. Note journey pipeline: stages before Middle Mile are done, Middle Mile highlighted as current
5. Type a command in the floating bar → SI acknowledgement popup
6. Click "Shipments" in breadcrumb → Shipments list; filter Live / Delivered; click a delivered row
7. Return to Overview (sidebar) → approve the OA recommendation in the approvals block
8. Switch to "Lane status" tab — per-lane metrics table + action buttons; map switches to heatmap (green/amber/red)
9. Try the "Color by" metric switch on the map: COP, failure rate, avg time
10. Click "Approve ice reduction" on Singapore-SYD → clears the pending item + toast
11. Toggle to "Exception" — Miami-NYC gains a "Review exception" action button in Lane status
12. Click "Review exception" → jumps to Lane Detail (breadcrumb: Overview / Lanes / Miami-NYC — both crumbs clickable)
13. Click "Middle Mile" stage node → shipment expansion; click a shipment row → Shipment Detail
14. Back to lane — Activity filter → "Agents only"
15. Click "Expand" on Resolution Agent row → Level 2
16. Click "See full trace" → Level 3 reasoning trace
17. "Approve" the exception → resolves with attribution line
18. Tab to History → out-of-range rate chart
19. Tab to Outlook → upcoming risks + recommendation
20. Sidebar → Manage lanes → configure rows + "Add lane" (both toast)
21. Sidebar → Agents → org-chart; click a card for detail panel; try Configure + "+ New agent" (toasts)
22. Sidebar → Products → product list → click Chilled Injectables → detail + rules + optimizations

## Replacing the logo

The demo uses an SVG approximation of the Sensos isometric cube mark.

To replace with the official logo:
1. Save the official SVG as `assets/logo.svg`
2. In `index.html`, find the two `<svg>` blocks inside `.sidebar-logo` and replace with:
   ```html
   <img src="assets/logo.svg" width="22" height="26" alt="Sensos">
   ```
3. For the title screen, find the `.logo-hero` SVG block and replace with:
   ```html
   <img src="assets/logo.svg" class="logo-hero" style="width:72px;height:84px;filter:brightness(0)invert(1)" alt="Sensos">
   ```
   Note: the stroke draw-in animation won't work with an `<img>` tag. To keep the animation, convert the official SVG paths to inline SVG with `class="logo-path"` on each path element.

## Files

```
demo/
  index.html      App shell (all screens as toggled sections)
  styles.css      Design system (CSS variables, all component styles)
  app.js          Navigation, state, all interactions
  data.js         Hardcoded demo content (lanes, activity, agents, etc.)
  assets/         (empty — place logo here when available)
  README.md       This file
```

## Design decisions

Every product and design decision behind the demo — IA, agentic model, metrics, progressive disclosure, aesthetic, what is real vs faked — is documented in [`../demo-design-decisions.md`](../demo-design-decisions.md). That doc is written for the presentation and can be lifted directly into slides.

## Editing content

All demo content lives in `data.js`. To change lane names, activity entries, agent details, or the exception scenario, edit that file only — no HTML or JS changes needed.
