# One-Pager — Lean Shipping Options

> **Artifact type:** One-Pager (alignment pitch for a specific idea)
> **Answers:** Should we invest time and resources in reducing shipping choice to a lean set of options?
> **Owner:** `te-0001` (Checkout) · **Status:** *Retrospective* — reconstructed from the shipped
> implementation so the repo has a real, reviewable one-pager. Copy this file as the template
> for the next initiative.
> Lines marked `[NEEDS VALIDATION]` are engineering inferences awaiting product confirmation.

## 1. Problem

VTEX checkout receives, per cart item, the full list of available SLAs (carrier + price +
`shippingEstimate` + delivery channel + optional delivery windows). Presenting that raw data
forces the shopper to compare an option matrix:

- A 4-item cart with 5 SLAs per item is 625 valid combinations.
- Multi-seller carts split into multiple packages, each with its own estimate.
- Some items are pickup-only; some carry mandatory scheduled delivery.

The shopper does not want to optimize a matrix. They want to answer one question: *cheapest,
fastest, or a sensible middle?* Every checkout surface that re-solves this problem locally
solves it slightly differently, so behavior diverges across VTEX surfaces.

## 2. Proposal

A dependency-light, UI-free JavaScript library that takes `logisticsInfo` and returns **at
most three** pre-composed options — `CHEAPEST`, `FASTEST`, and `COMBINED` — plus the helpers
needed to display them and to apply the shopper's choice back to the cart.

Published as `@vtex/lean-shipping-calculator` and consumed by `checkout-ui` and
`shipping-manager`. No `orderForm` mutation: pure functions in, new `logisticsInfo` out.

## 3. Hypotheses

| # | Hypothesis | How we would know |
|---|---|---|
| H1 | Shoppers decide faster when shipping is framed as *cheapest / fastest / middle* rather than as an SLA list. | Time-to-shipping-selection and shipping-step drop-off in consuming checkouts. `[NEEDS VALIDATION]` |
| H2 | Three options is enough; a fourth adds cognitive cost without conversion. | Selection distribution across the three IDs. `[NEEDS VALIDATION]` |
| H3 | An intermediate `COMBINED` option is only useful when it is *strictly* faster than cheapest **and** strictly cheaper than fastest — otherwise it is noise. | Implemented as `filterEqualOptions` + `filterPreviousExpensiveOptions` in `react/leanShipping.js`. |
| H4 | Centralizing the calculation reduces divergent shipping behavior across VTEX surfaces more cheaply than aligning independent implementations. | Count of independent implementations; cross-surface bug reports. |

## 4. Assumptions

- `logisticsInfo` is authoritative and already filtered by trade policy / sales channel by the
  time it reaches this library. The library does not re-check availability beyond
  `selectedSla === null && selectedDeliveryChannel === null` (unavailable item).
- Estimate math is owned by `@vtex/estimate-calculator`; package composition by
  `@vtex/delivery-packages`. This library composes, it does not recompute.
- Option **labels, copy, and translation are the consumer's responsibility**. The library
  returns IDs and numbers only.
- Consumers apply the returned `logisticsInfo` through the standard checkout update flow.
- VTEX browser globals (`window.vtex`, `window.vtexjs`, `window.logSplunk`) may be absent —
  npm-only consumers must still work. Holds today only while a `window` object exists; with no
  `window` global at all the library throws (gap G1 in [prd.md](./prd.md) §8).

## 5. Scope of the bet

**In:** option reduction (cheapest / fastest / combined); structured option details for display;
which option should be selected; applying a chosen SLA across items; switching delivery channel
(`delivery` ↔ `pickup-in-point`); scheduled-delivery and delivery-window awareness.

**Out:** UI components, copy/i18n, price or promotion calculation, `orderForm` mutation,
address handling, account-specific rules.

## 6. Target metrics

| Metric | Target | Confidence |
|---|---|---|
| Options presented per cart | ≤ 3, deduplicated | Shipped — enforced in code |
| Independent lean-shipping implementations in VTEX | 0 | Shipped — `checkout-ui` + `shipping-manager` consume this lib |
| MAJOR (breaking) releases | ~0/year | Shipped — 21 patch releases on `0.2.x` |
| Shipping-step drop-off in consuming checkouts | Decrease vs. raw SLA list | `[NEEDS VALIDATION]` — no product baseline in repo |
| Share of sessions selecting `COMBINED` | Non-trivial, else retire H3 | `[NEEDS VALIDATION]` — needs decision telemetry |

## 7. Cost / risk

- **Cost:** small, well-bounded library; ongoing cost is maintenance, not build
  (lifecycle `maintenance` in `.vtex/catalog-info.yaml`).
- **Risk — blast radius:** a defect reaches every consuming checkout. Mitigated by
  NON-NEGOTIABLE test coverage, SonarQube in CI, and Husky pre-push gates.
- **Risk — contract rigidity:** the value is API stability, so genuinely new needs are
  awkward to express. Mitigated by keeping new behavior behind the existing 5 exports.
- **Risk — unmeasured heuristic:** the "worthiness" rules for `COMBINED` are engineering
  judgment, not measured shopper behavior. This is the largest open gap. `[NEEDS VALIDATION]`

## 8. Recommendation

Proceed / continue. The library is shipped and load-bearing; the outstanding investment is
**decision telemetry** to convert H1–H3 from assumptions into measured facts before any
change to the reduction heuristic.

## 9. Provenance

[`react/leanShipping.js`](../../react/leanShipping.js) · [`react/constants.js`](../../react/constants.js) ·
[`README.md`](../../README.md) · [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) ·
[`.vtex/catalog-info.yaml`](../../.vtex/catalog-info.yaml) · [`CHANGELOG.md`](../../CHANGELOG.md)
