<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.2.0 (MINOR - added Public API Reference section)

Modified principles: None

Added sections:
- Public API Reference (complete documentation of 5 exported functions)

Removed sections: None

Templates status:
- .specify/templates/plan-template.md ✅ Compatible
- .specify/templates/spec-template.md ✅ Compatible
- .specify/templates/tasks-template.md ✅ Compatible

Follow-up TODOs: None
-->

# Lean Shipping Calculator Constitution

## Core Principles

### I. Library-First Design

Every feature MUST be implemented as a self-contained, independently testable module with a clear public API.

- Exports MUST be explicit and intentional
- Internal implementation details MUST NOT leak through the public API
- Each function MUST have a single, well-defined responsibility
- Dependencies between modules MUST be minimized

**Rationale**: As a published npm package (@vtex/lean-shipping-calculator), API clarity and stability directly impact downstream consumers.

### II. Code Quality

All code MUST maintain consistency with existing patterns and follow VTEX coding standards.

- New code MUST follow existing JavaScript (ES6+) patterns in the codebase
- Functions MUST have clear, descriptive names that indicate their purpose
- Complex logic MUST be broken into smaller, testable functions
- Lodash utilities SHOULD be preferred over custom implementations for common operations
- JSDoc comments SHOULD be added to public API functions to document parameters and return types

**Rationale**: Consistent code patterns reduce cognitive load and make the codebase easier to maintain and extend.

**Migration Path**: TypeScript migration is encouraged for new modules when team capacity allows. New `.ts` files MUST use strict mode.

### III. Test Coverage (NON-NEGOTIABLE)

All features MUST have corresponding tests before merge.

- Unit tests MUST cover public API functions
- Edge cases (null inputs, empty arrays, boundary conditions) MUST be tested
- Tests MUST run in pre-push hooks via Husky
- Test failures MUST block merge
- Test fixtures SHOULD be used for complex logistics scenarios

**Rationale**: As a shared utility library, regressions propagate to multiple consuming applications. Tests are the safety net.

### IV. Backward Compatibility

Breaking changes to the public API MUST follow semantic versioning and require explicit justification.

- MAJOR version bump required for: function signature changes, removed exports, behavior changes
- MINOR version bump for: new functions, new optional parameters
- PATCH version bump for: bug fixes, internal refactoring with no API change
- Deprecation warnings MUST precede removals by at least one minor version
- CHANGELOG.md MUST be updated for every release

**Rationale**: Downstream consumers depend on stable interfaces; unexpected breaks erode trust and cause production incidents.

### V. Simplicity

Prefer the simplest solution that meets requirements.

- YAGNI: Do not add functionality until it is needed
- Avoid abstractions until patterns repeat at least twice
- Prefer pure functions over stateful implementations
- Code MUST be readable without requiring extensive comments

**Rationale**: Complexity is the enemy of maintainability. Simple code is easier to test, debug, and evolve.

### VI. Observability

Code MUST support debugging and monitoring in production environments.

- Critical decision points SHOULD emit structured logs
- Log sampling MUST be used to avoid overwhelming logging infrastructure (current: 10% sampling rate)
- Logs MUST include relevant context (orderFormId, account, workflow identifiers)
- Error conditions MUST be logged with sufficient detail for diagnosis

**Rationale**: As a library running in checkout flows, observability is critical for diagnosing production issues without access to end-user environments.

## Public API Reference

The library exports 5 functions via default export from `@vtex/lean-shipping-calculator`:

### `getLeanShippingOptions({ logisticsInfo, activeChannel, isScheduledDeliveryActive })`

**Purpose**: Calculate and return the best "lean" shipping options for a cart.

**Parameters**:
- `logisticsInfo` (Array) - Logistics info for each cart item
- `activeChannel` (String, default: `'delivery'`) - `'delivery'` or `'pickup-in-point'`
- `isScheduledDeliveryActive` (Boolean, default: `false`) - Whether scheduled delivery is active

**Returns**: Object with up to 3 options (only those worth showing):
```js
{
  cheapest: [...],  // Cheapest option (logisticsInfo with selected SLAs)
  fastest: [...],   // Fastest option
  combined: [...]   // Intermediate option (faster than cheapest, cheaper than fastest)
}
```

**Behavior**: Calculates best option by price, best by delivery time, and an intermediate "combined" option if applicable. Filters duplicates. Emits Splunk logs (10% sampling).

### `getOptionsDetails(delivery)`

**Purpose**: Transform shipping options into a structured format with display-friendly details.

**Parameters**:
- `delivery` (Object) - Object with `CHEAPEST`, `COMBINED`, `FASTEST` keys containing logisticsInfo arrays

**Returns**: Array of option details:
```js
[{
  id: 'CHEAPEST',
  price: 1000,                      // Total price in cents
  shippingEstimate: '8bd',          // Delivery estimate string
  averageEstimatePerItem: 520200,   // Average in seconds
  packagesLength: 2                 // Number of packages
}]
```

### `getSelectedDeliveryOption({ optionsDetails, newCombined, newFastest, newCheapest, activeDeliveryOption })`

**Purpose**: Determine which shipping option should be selected (maintains current if valid, otherwise selects first).

**Parameters**:
- `optionsDetails` (Array, optional) - Result from `getOptionsDetails`
- `newCombined`, `newFastest`, `newCheapest` (Array) - logisticsInfo for each option
- `activeDeliveryOption` (String) - Currently selected option ID

**Returns**: String - ID of the option that should be selected.

### `setSelectedSlaFromSlaOption({ logisticsInfo, action, items, sellers, channel, canEditData, slaOption })`

**Purpose**: Update logisticsInfo for all items to use a specific SLA (e.g., when user selects "Express").

**Parameters**:
- `logisticsInfo` (Array) - Current logistics info
- `action` (Object) - Action with `address` and `searchAddress`
- `items` (Array) - Cart items
- `sellers` (Array) - Involved sellers
- `channel` (String) - Delivery channel
- `canEditData` (Boolean) - Whether data can be edited
- `slaOption` (String) - SLA ID to select (e.g., `'Expressa'`)

**Returns**: New logisticsInfo with the selected SLA applied to all compatible items.

### `setSelectedDeliveryChannel(logisticsInfo, deliveryChannel)`

**Purpose**: Change the delivery channel (`delivery` or `pickup-in-point`) across all logisticsInfo.

**Parameters**:
- `logisticsInfo` (Array|Object) - Logistics info (array or single object)
- `deliveryChannel` (String) - `'delivery'` or `'pickup-in-point'`

**Returns**: New logisticsInfo with `selectedDeliveryChannel` updated.

## Technology Stack

- **Language**: JavaScript (ES6+) transpiled via Babel
- **Runtime**: Browser (VTEX IO storefront) + Node.js (npm package consumers)
- **Package Manager**: yarn (workspace) / npm (consumers)
- **Testing**: Jest with fixtures (via `yarn --cwd react test`)
- **Linting**: ESLint with @vtex/eslint-config
- **Formatting**: Prettier with @vtex/prettier-config
- **Pre-commit/push**: Husky (lint + test)
- **Build**: Babel CLI with preset-env, preset-react

**Key Dependencies**:
- `lodash` - Utility functions (intersection, minBy, sortBy, sumBy, isEqual, omit)
- `@vtex/estimate-calculator` - Shipping estimate calculations
- `@vtex/delivery-packages` - Delivery package utilities

**VTEX Runtime Dependencies**:
- `window.vtex` - Account information, vtexid
- `window.vtexjs` - Checkout API (orderFormId)
- `window.__RUNTIME__` - IO Runtime context
- `window.logSplunk` - Observability integration (optional)

**Constraints**:
- MUST maintain compatibility with both Node.js and browser environments
- MUST NOT introduce dependencies that increase bundle size significantly
- MUST follow VTEX coding standards
- MUST gracefully handle missing VTEX globals (for npm-only consumers)

## Development Workflow

1. **Feature Development**:
   - Create feature branch from main
   - Write/update tests for new functionality
   - Implement feature following existing patterns
   - Ensure all tests pass locally (`yarn test`)
   - Ensure linting passes (`yarn lint`)

2. **Code Review**:
   - All changes require pull request review
   - Husky pre-push hooks MUST pass
   - CI checks MUST be green before merge

3. **Release**:
   - Follow semantic versioning
   - Update CHANGELOG.md with changes (Keep a Changelog format)
   - Tag releases appropriately
   - Run `yarn --cwd react build` before publishing

## Governance

This constitution supersedes all other development practices for this repository.

- **Amendments**: Changes to this constitution require documentation of the change rationale, review by maintainers, and a version bump to the constitution itself.
- **Compliance**: All pull requests MUST verify compliance with these principles. Reviewers SHOULD reference specific principles when requesting changes.
- **Exceptions**: Violations of principles MUST be documented in the PR description with explicit justification. Exceptions do not set precedent.

**Version**: 1.2.0 | **Ratified**: 2026-05-12 | **Last Amended**: 2026-05-13
