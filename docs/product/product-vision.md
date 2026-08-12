# Product Vision — Lean Shipping Calculator

> **Artifact type:** Product Vision (north star, 3–5 years)
> **Answers:** Where are we going, and why does this library exist at all?
> **Owner:** `te-0001` (Checkout) · **Lifecycle:** `maintenance`
> **Status:** derived from repository sources (see *Provenance*). Lines marked
> `[NEEDS VALIDATION]` are engineering inferences that require product confirmation.

## 1. Purpose

Choosing how a purchase will be delivered is one of the last — and most abandonment-prone —
decisions a shopper makes. Raw VTEX logistics data exposes every SLA for every item, which
is accurate but unusable: a 4-item cart with 5 SLAs each is 625 possible combinations.

Lean Shipping Calculator exists to collapse that combinatorial space into a **small set of
meaningful choices**: the cheapest way to receive the order, the fastest way, and — when it
is genuinely worth showing — an intermediate "combined" option. It is the single, shared
implementation of that reduction across VTEX checkout surfaces.

## 2. North star

> Any VTEX checkout surface can present shipping choices that a shopper understands in
> seconds, using one shared, deterministic calculation — never a per-surface reimplementation.

## 3. Target audience

| Audience | Relationship to this library |
|---|---|
| **Primary — VTEX engineering teams** | Consume `@vtex/lean-shipping-calculator` as an npm package / VTEX IO app. Known consumers: `checkout-ui`, `shipping-manager` (`.vtex/catalog-info.yaml` → `subcomponentOf`). |
| **Secondary — VTEX merchants** | Benefit indirectly: consistent shipping presentation without custom logistics code. |
| **End beneficiary — shoppers** | Get 1–3 comprehensible delivery options instead of an SLA matrix. |

This library has no UI and no direct end-user surface. Its "product" is a **contract**.

## 4. Market impact / why VTEX owns this

- Shipping choice presentation is core checkout conversion surface; it cannot be delegated
  to per-account custom code without fragmenting behavior.
- Logistics semantics (SLAs, delivery channels, delivery windows, scheduled delivery,
  pickup points, multi-seller carts) are VTEX-platform-specific. Encoding them once
  prevents each consumer from re-deriving them — and re-deriving them differently.
- Because a bug here propagates to every consuming checkout, correctness has outsized value.
  This is the explicit rationale behind the NON-NEGOTIABLE test principle in the constitution.

## 5. Where we are going (3–5 years)

Ordered by confidence, highest first.

1. **Stay the canonical lean-shipping contract.** The 5 exported functions remain the one
   way VTEX surfaces reduce logistics data to shipper-facing options. Strict semver;
   breaking changes coordinated with `checkout-ui` and `shipping-manager`.
2. **Stay boring and provable.** Pure functions, no hidden state, high fixture-based test
   coverage, SonarQube-gated. The library should be reviewable end-to-end by one engineer.
3. **Grow logistics coverage, not surface area.** New logistics capabilities (scheduled
   delivery, delivery windows, pickup points already landed) should arrive as richer
   behavior *behind the existing API*, not as new exports. `[NEEDS VALIDATION]`
4. **Gradual typing.** Progressive TypeScript adoption for new modules, so consumers get
   compile-time guarantees on the logisticsInfo shapes (constitution, Principle II
   migration path). `[NEEDS VALIDATION]` — dependent on team capacity.
5. **Observable by default.** Every non-obvious selection decision is diagnosable in
   production from structured, sampled logs (Principle VI) without reproducing a shopper's
   cart. `[NEEDS VALIDATION]` on target: today logging is Splunk-based at 10% sampling.

## 6. Explicit non-goals

- **Not** a UI library. No React components, no copy, no i18n of option labels.
- **Not** a pricing or promotions engine. It reads SLA prices; it does not compute them.
- **Not** a checkout orchestrator. It never mutates `orderForm` directly — it returns new
  `logisticsInfo` for the caller to apply.
- **Not** a general logistics SDK. Estimate math lives in `@vtex/estimate-calculator`;
  package composition lives in `@vtex/delivery-packages`.
- **Not** a place for account-specific or seller-specific business rules.

## 7. Success signals (directional, not KPIs)

| Signal | Why it matters |
|---|---|
| Number of independent lean-shipping implementations inside VTEX | Should trend to zero. Duplication is the failure mode this library exists to prevent. |
| Breaking (MAJOR) releases per year | Should stay at or near zero; the contract's value is its stability. |
| Regression escapes to consuming checkouts | Should be zero. Escapes indicate a fixture gap. |
| Time for a new engineer to make a safe change | Should be hours, not weeks — hence devcontainer + SDD + constitution. |

## 8. Provenance

Derived from, and must stay consistent with:

- [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) — principles, public API reference, tech stack (v1.2.0)
- [`README.md`](../../README.md) — public API and usage
- [`react/index.js`](../../react/index.js) — the 5 exported functions
- [`react/constants.js`](../../react/constants.js) — `CHEAPEST` / `FASTEST` / `COMBINED`, channels
- [`.vtex/catalog-info.yaml`](../../.vtex/catalog-info.yaml) — owner `te-0001`, system `checkout`, lifecycle `maintenance`, consumers
- [`CHANGELOG.md`](../../CHANGELOG.md) — evolution to date (current `0.2.21`)
- External design doc: <https://docs.google.com/document/d/1tDhV1ZOhHhwRYXRGcYmsLvNjsc2pzfQGHKePV68BEKg>
