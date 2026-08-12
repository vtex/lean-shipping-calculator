# PRD — Lean Shipping Calculator

> **Artifact type:** Product Requirements Document (execution blueprint)
> **Answers:** What exact components, rules, and logic must be built?
> **Owner:** `te-0001` (Checkout) · **System:** `checkout` · **Lifecycle:** `maintenance`
> **Baselined against:** `@vtex/lean-shipping-calculator@0.2.21` (`react/package.json`)
> **Status:** *As-built* — documents the shipped contract so future specs have a baseline to
> diff against. `[NEEDS VALIDATION]` marks engineering inference, not confirmed product intent.

Upstream artifacts: [product-vision.md](./product-vision.md) → [one-pager.md](./one-pager.md) → **this PRD** →
SDD spec (`.specify` / `specs/<feature>/spec.md`).

---

## 1. Context

The library reduces VTEX `logisticsInfo` into at most three shipper-facing delivery options and
provides the helpers to display them and apply a choice. It is UI-free and side-effect-free
apart from sampled logging. Consumers: `checkout-ui`, `shipping-manager`.

## 2. Users and user stories

### Consumer engineer (primary user of the API)

- **US-1** — As a checkout engineer, I pass `logisticsInfo` and the active channel and get back
  only the options worth showing, so I do not implement SLA reduction myself.
- **US-2** — As a checkout engineer, I get each option as `{ id, price, shippingEstimate,
  averageEstimatePerItem, packagesLength }` so I can render it without touching raw SLAs.
- **US-3** — As a checkout engineer, when the cart changes I ask which option should now be
  selected and keep the shopper's previous choice whenever it is still valid.
- **US-4** — As a checkout engineer, when the shopper picks a named SLA (e.g. `Expressa`) I
  apply it across all compatible items in one call.
- **US-5** — As a checkout engineer, I switch the whole cart between `delivery` and
  `pickup-in-point` in one call.
- **US-6** — As a checkout engineer, I can consume the package from plain Node (tests, SSR)
  where the `window` global does not exist, without crashes.
  > **Not as-built — see gap G1 in §8.** This is the intended contract, not the shipped one.

### Shopper (indirect beneficiary)

- **US-7** — As a shopper, I see a short, distinct list of delivery options instead of an SLA matrix.
- **US-8** — As a shopper, my previously chosen option is not silently reset when it remains available.
- **US-9** — As a shopper, items that can only be picked up do not break or distort the delivery options.

### Support / on-call engineer

- **US-10** — As an on-call engineer, I can reconstruct why an option was offered or selected
  from structured logs, without reproducing the shopper's cart.

## 3. Functional requirements

### FR-1 — `getLeanShippingOptions({ logisticsInfo, activeChannel = 'delivery', isScheduledDeliveryActive = false })`

- **FR-1.1** Returns an object containing only the keys that are worth showing, from
  `cheapest`, `fastest`, `combined`. Each value is a `logisticsInfo` array with `selectedSla` applied.
- **FR-1.2** Candidate SLAs are filtered to the delivery channel and exclude SLAs with delivery
  windows (`filterSlasByChannel` → `isDelivery(sla) && !hasDeliveryWindows(sla)`).
- **FR-1.3** SLA price for an option is the **accumulated** price of that SLA id across all
  `logisticsInfo` entries (`getSlaAccumulatedPrice`).
- **FR-1.4** `shippingEstimate` is converted to seconds via `@vtex/estimate-calculator`
  (`getShippingEstimateQuantityInSeconds`) for ordering; the library never parses estimate strings itself.
- **FR-1.5** Unavailable items (`selectedSla === null && selectedDeliveryChannel === null`) are
  passed through untouched.
- **FR-1.6** Items that are pickup while the active channel is pickup are passed through untouched.
- **FR-1.7** Items whose only SLA is a mandatory scheduled-delivery SLA are respected rather
  than forced into a lean option.
- **FR-1.8** `COMBINED` is emitted only when it differs from both `CHEAPEST` and `FASTEST`.
- **FR-1.9** All returned arrays preserve the input `itemIndex` alignment.

### FR-2 — `getOptionsDetails(delivery)`

- **FR-2.1** Accepts `{ CHEAPEST?, COMBINED?, FASTEST? }` and returns an array ordered
  `CHEAPEST → COMBINED → FASTEST`, skipping absent or empty entries.
- **FR-2.2** Each entry: `{ id, price, shippingEstimate, averageEstimatePerItem, packagesLength }`.
- **FR-2.3** Options identical on every field except `id` are deduplicated (`filterEqualOptions`),
  keeping the first occurrence.
- **FR-2.4** An option that is not strictly cheaper than the next option in the list is dropped
  (`filterPreviousExpensiveOptions`) — a slower-and-not-cheaper option is never shown.
- **FR-2.5** `packagesLength` accounts for SLA estimates and pickup-only items
  (see `CHANGELOG` 0.2.18, 0.2.19).

### FR-3 — `getSelectedDeliveryOption({ optionsDetails = null, newCombined, newFastest, newCheapest, activeDeliveryOption })`

- **FR-3.1** When `optionsDetails` is omitted, derive it from the provided option arrays.
- **FR-3.2** If `activeDeliveryOption` still exists in the available options, return it unchanged (US-8).
- **FR-3.3** Otherwise return the first available option's `id`.
- **FR-3.4** If no options are available, return `activeDeliveryOption` as-is.

### FR-4 — `setSelectedSlaFromSlaOption({ logisticsInfo, action, items, sellers, channel, canEditData, slaOption })`

- **FR-4.1** Applies `slaOption` to every item that offers it; items that do not offer it keep
  their current selection.
- **FR-4.2** Returns a **new** `logisticsInfo`; never mutates the input.
- **FR-4.3** Tolerates `action.address` / `action.searchAddress` being `undefined`
  (regression fixed in 0.2.17 — must stay covered by tests).

### FR-5 — `setSelectedDeliveryChannel(logisticsInfo, deliveryChannel)`

- **FR-5.1** Accepts an array or a single `logisticsInfo` object.
- **FR-5.2** Sets `selectedDeliveryChannel` to `delivery` or `pickup-in-point` across entries.
- **FR-5.3** Switching between delivery and pickup with an item available only for pickup keeps
  a valid selection (regression fixed in 0.2.20 — must stay covered by tests).

### FR-6 — Runtime portability

- **FR-6.1** *As-built.* When a `window` object exists but `window.vtex`, `window.vtexjs`,
  `window.__RUNTIME__`, or `window.logSplunk` is missing, nothing throws — logging degrades to
  a no-op.
- **FR-6.2** *Target, not as-built (gap G1).* When there is no `window` global at all — plain
  Node, SSR — the exported functions MUST NOT throw. They currently do:
  `getAccountName` and `logReport` in `react/leanShipping.js` read the bare `window` identifier,
  and `getLeanShippingOptions` always calls `logReport`.
- **FR-6.3** The published package exposes a single default export object with exactly the five
  functions above (`react/index.js`).

## 4. Non-functional requirements

Per the NFR golden path workflow (`sdlc-golden-path` skill). Waivers are explicit, not omissions.

- **NFR-O11y-1** — Option-selection decision points emit structured logs via `window.logSplunk`
  at **10% sampling**, including `orderFormId` and account context, and never include PII
  (constitution Principle VI).
  > O11y golden path: <https://github.com/vtex/diagnostics> (`docs/diagnostics-specification`).
  > `[NEEDS VALIDATION]` — the mirror was not reachable from this environment; alignment of the
  > current Splunk-based logging with the diagnostics spec is an open manual-review item.
- **NFR-O11y-2 (tracing / metrics / health checks / dashboards)** — **N/A** — this is an
  in-process pure-function library: no HTTP endpoints, no workers, no event publishers, no
  outbound service calls. Telemetry belongs to the consuming application
  (`vtex.com/o11y-os-index: checkout_ui*` in `.vtex/catalog-info.yaml`).
- **NFR-Compat-1** — Strict semver. MAJOR for signature/behavior changes, MINOR for additive,
  PATCH for fixes. Deprecations precede removal by ≥ 1 minor. `CHANGELOG.md` updated per release.
- **NFR-Quality-1** — Public API functions and edge cases (null inputs, empty arrays, boundary
  conditions) MUST have Jest tests. Failures block merge (Husky pre-push + `node-ci-v2` CI).
- **NFR-Quality-2** — SonarQube scan on every PR and on `main` (`.vtex/deployment.yaml`).
- **NFR-Security-1** — No credentials, tokens, or app keys in source; `.env.local` is gitignored.
  Inputs are cart data supplied by the caller — no secret handling in this library.
- **NFR-Privacy-1** — `logisticsInfo` may carry address data. The library MUST NOT log addresses
  or any personally identifiable field.
- **NFR-Perf-1** — Runs synchronously in the checkout shipping step. Complexity MUST stay linear
  in `items × SLAs`; no network calls, no heavy dependencies. `[NEEDS VALIDATION]` — no latency
  budget is documented in the repo.
- **NFR-Portability-1** — Bundle size impact must stay negligible (lodash imported per-function,
  not wholesale) — as-built. Running outside a browser-like environment (plain Node, SSR) is a
  **target, not as-built**: see gap G1 in §8.
- **NFR-DevEx-1** — A contributor can reach a working lint + test loop from a clean machine via
  the dev container ([`.devcontainer/`](../../.devcontainer)), pinned to the CI Node version.

## 5. Scope boundaries

**In scope:** the five exported functions; logistics reduction rules; channel switching;
scheduled-delivery and delivery-window awareness; fixtures and tests; the published npm package.

**Out of scope:** UI components and copy/i18n; price, freight, and promotion computation;
`orderForm` mutation or checkout orchestration; address form or address validation;
account- or seller-specific business rules; estimate math (`@vtex/estimate-calculator`) and
package composition (`@vtex/delivery-packages`).

## 6. KPIs

| KPI | Definition | Target | Source |
|---|---|---|---|
| Options shown per cart | Distinct options returned by `getOptionsDetails` | ≤ 3, deduplicated | Enforced in code |
| Test coverage of `react/` | Jest line coverage reported to SonarQube | No regression release-over-release | `yarn test:coverage` + SonarQube |
| SonarQube quality gate | PR + `main` gate | Pass | `.vtex/deployment.yaml` |
| Breaking releases | MAJOR bumps per year | 0 | `CHANGELOG.md` |
| Consumer-reported regressions | Defects raised by `checkout-ui` / `shipping-manager` | 0 per release | `[NEEDS VALIDATION]` — tracking system not defined in repo |
| Shipping-step drop-off | Consumer-side funnel | Decrease | `[NEEDS VALIDATION]` — owned by consuming app, not this library |
| `COMBINED` selection share | % of sessions selecting `COMBINED` | Non-trivial, else retire the option | `[NEEDS VALIDATION]` — requires decision telemetry |

## 7. Acceptance / verification

A change to this library is done when:

1. `yarn lint` and `yarn test` pass locally (Husky pre-push enforces both).
2. `yarn test:coverage` shows no coverage regression; SonarQube gate is green.
3. Regression fixtures for the historically fixed cases still pass — pickup-only items
   (0.2.19, 0.2.20), `packagesLength` with SLA estimate (0.2.18), `undefined` address (0.2.17).
4. `react/index.js` exports are unchanged, or the change is coordinated with `checkout-ui` and
   `shipping-manager` owners and released as MAJOR.
5. `CHANGELOG.md` is updated (Keep a Changelog) and the version bump matches the change class.
6. No autonomy-limited file (`manifest.json`, `.vtex/*.yaml`, `react/package.json` prod deps,
   `publish-release.sh`, Husky hooks, constitution) changed without explicit human approval.

## 8. Open questions and known gaps

### Known gaps (as-built ≠ intended contract)

| # | Gap | Evidence | Owner |
|---|---|---|---|
| G1 | The library throws in an environment with no `window` global, breaking US-6 / FR-6.2 / NFR-Portability-1. | `getAccountName` and `logReport` in [`react/leanShipping.js`](../../react/leanShipping.js) read the bare `window` identifier; `getLeanShippingOptions` always calls `logReport`. `node -e "window.vtex"` → `ReferenceError: window is not defined`. Not caught by tests: jest@23 defaults to the jsdom environment, which defines `window`. | `te-0001` — fix tracked separately (`typeof window` guard + a test with `@jest-environment node`, released as a patch). |

### Open questions

| # | Question | Owner |
|---|---|---|
| Q1 | What are the real conversion baselines for H1–H3 in [one-pager.md](./one-pager.md)? | Product `[NEEDS VALIDATION]` |
| Q2 | Should the current Splunk logging migrate to the `vtex/diagnostics` golden path, or is it explicitly waived for libraries? | `te-0001` + Diagnostics |
| Q3 | Is there a latency budget for the shipping step that this library must fit inside? | `te-0001` |
| Q4 | Is `COMBINED` earning its place, or should it be retired? | Product + `te-0001` |
| Q5 | Does the TypeScript migration path (constitution II) have committed capacity? | `te-0001` |

## 9. Provenance

[`react/index.js`](../../react/index.js) · [`react/leanShipping.js`](../../react/leanShipping.js) ·
[`react/changeActiveSlas.js`](../../react/changeActiveSlas.js) · [`react/utils.js`](../../react/utils.js) ·
[`react/constants.js`](../../react/constants.js) · [`react/__tests__/`](../../react/__tests__) ·
[`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) · [`README.md`](../../README.md) ·
[`CHANGELOG.md`](../../CHANGELOG.md) · [`.vtex/catalog-info.yaml`](../../.vtex/catalog-info.yaml) ·
[`.vtex/deployment.yaml`](../../.vtex/deployment.yaml)
