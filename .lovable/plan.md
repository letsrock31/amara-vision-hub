## Scope

Massive functional upgrade across 17 areas (A–Q) of the Cognilix | Amara Raja prototype. No existing layout/theme/data changes — only additive flows, modals, drawers, sub-views, and state.

## Implementation Order

1. **AppContext extensions (Part A)** — single source of truth. Add cart, orders, serviceRequests, complaints, releaseOrders, notifications, posEntries, draftReleaseOrder, selectedSiteId, dormantFilter, pendingOrdersFilter, showLowStockBanner. Seed orders from DEALER_ORDERS, 2 release orders per contract, 5 notifications, 6 POS entries. Wire profile switch to clear scoped filters but preserve transactional collections.

2. **Shared building blocks (in `ui-bits.tsx` + new files)**
   - `RightDrawer` (sticky, click-outside disabled)
   - `Modal` wrapper (sticky)
   - `StageTimeline` (5-stage tracker)
   - `TrackOrderModal`, `InvoicePanel`, `ComplaintModal`, `EscalateModal`, `ServiceRequestModal`, `UnitHistoryModal` — reused everywhere
   - ID generators (`genId('ORD')`, etc.)

3. **Header (Part B)** — bell with unread badge + slide-down notifications panel; search icon → inline input → dropdown across orders/contracts/sites.

4. **Dealer screens** — DealerHome (clickable stat cards, trade scheme card+modal, DSR contact, reorder flow), Catalog (product detail modal, promo code, full order confirmation modal with address/date/urgent), MyOrders (real filtering, expandable rows, Track/Invoice/Complaint/Reorder/Rate flows + Complaints section), POS Entry (low-stock banner, Sales Analytics panel, edit/delete/export/filter).

5. **RSM/Admin** — RSM Dashboard (clickable cards, Dealer Performance table, schedule visit, mark priority), Dealer Orders drawer with Escalate + Contact Dealer + Region/Status filters, Secondary Sales (clickable bars, SKU detail modal, Region detail modal, Stock-out alerts with Send Alert/Create Order on Behalf/Download). Admin Dashboard regional breakdown + top dealers panels.

6. **IAM screens** — Customer 360 sub-view (with Schedule Review), Fleet Health drawer + unit table + history modal + raise SR + Replace All Critical + Replacement Pipeline modal. Contracts drawer with terms, forecast, release orders, Request Amendment, Flag for Renewal.

7. **Industrial Customer** — My Sites detail sub-view with units table, comments + escalate on SRs. My Contracts accordion of release orders + complaint + Renewal request + Saved Drafts. Place Release Order full flow with validation, Add New Site, Save as Draft, Confirm modal, success state.

8. **Polish** — toasts where specified, ensure modals don't close on outside click, persist all generated IDs in context.

## Technical Notes

- All new state lives in `src/lib/app-context.tsx`; existing state preserved.
- New components in `src/components/` (ActionModal already exists; add `RightDrawer.tsx`, `OrderModals.tsx`, `ServiceModals.tsx`, `NotificationsPanel.tsx`, `HeaderSearch.tsx`).
- Screens stay in `src/components/screens.tsx`; add sub-views via local `useState` for `customer360`, `currentSiteView` rather than new routes.
- IDs: `ORD-1042`, `SR-2031`, etc., generated via incrementing counter + random suffix, stored in context.
- Sticky modals: replace any `onClick` overlay-close with no-op; only buttons close.
- Reuse existing `StageTimeline`, `Btn`, `StatCard`, `AISuggestions`, `CogniqPanel`.

## Out of Scope

- No theme, layout, sidebar, Cogniq chip, mock data value changes.
- No backend; all state session-scoped.

## Deliverable

Single commit ships all 17 parts. Final message lists which screens/files changed and confirms the new flows are wired end-to-end.
