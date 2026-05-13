# Lean Shipping Calculator

Utility library for calculating "lean" shipping options in VTEX checkout.

## Quick Reference

```bash
# Main commands
yarn test              # Run tests (from root)
yarn lint              # Check linting
yarn lint:fix          # Fix linting issues automatically
yarn test:coverage     # Run tests with coverage report
yarn --cwd react build # Build for publishing

# Quality commands
yarn sonar             # Run SonarQube analysis (requires server)
yarn sonar:local       # Run coverage + SonarQube analysis
yarn quality           # Full quality check: lint + coverage + sonar
```

## Git Hooks (Husky)

| Hook | Runs | Purpose |
|------|------|---------|
| `pre-commit` | `yarn lint` | Ensure code quality before commit |
| `pre-push` | `yarn lint && yarn test:coverage` | Full validation before push |

## SonarQube Setup

1. Copy the example env file:
```bash
cp .env.local.example .env.local
```

2. Configure your credentials in `.env.local`:
```bash
SONAR_HOST_URL=http://sonarqube.vtex.systems/
SONAR_TOKEN=your_token_here
```

3. Run analysis:
```bash
yarn sonar:local  # Coverage + SonarQube
```

> **Note**: `.env.local` is gitignored - never commit tokens!

## Project Structure

```
react/
├── index.js           # Entry point - exports 5 functions
├── leanShipping.js    # Core logic (getLeanShippingOptions, getOptionsDetails, getSelectedDeliveryOption)
├── changeActiveSlas.js # setSelectedSlaFromSlaOption
├── utils.js           # setSelectedDeliveryChannel + helpers
├── constants.js       # CHEAPEST, FASTEST, COMBINED, DELIVERY, PICKUP_IN_STORE
├── DeliveryPackagesUtils.js
├── logisticsInfo.js
└── __tests__/         # Jest tests with fixtures
```

## Exported API (5 functions)

| Function | Purpose |
|----------|---------|
| `getLeanShippingOptions` | Calculate shipping options (cheapest, fastest, combined) |
| `getOptionsDetails` | Transform options into structured format for display |
| `getSelectedDeliveryOption` | Determine which option should be selected |
| `setSelectedSlaFromSlaOption` | Apply a specific SLA to all items |
| `setSelectedDeliveryChannel` | Change delivery channel (delivery/pickup) |

## Code Patterns

- **JavaScript ES6+** with Babel (not TypeScript)
- **Lodash** for common operations (intersection, minBy, sortBy, isEqual, omit)
- **Pure functions** preferred over stateful implementations
- **Tests required** for all public functionality

## VTEX Dependencies (Browser)

The code accesses VTEX globals when available:
- `window.vtex` - Account information
- `window.vtexjs` - Checkout API (orderFormId)
- `window.__RUNTIME__` - IO Runtime context
- `window.logSplunk` - Logging (10% sampling)

## Principles (see `.specify/memory/constitution.md`)

1. **Library-First Design** - Clear API, independent modules
2. **Code Quality** - Consistent patterns, descriptive names
3. **Test Coverage** - Required tests (NON-NEGOTIABLE)
4. **Backward Compatibility** - Strict semver
5. **Simplicity** - YAGNI, pure functions
6. **Observability** - Structured logs with sampling

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `chore:` maintenance
- `test:` tests

## Useful Links

- [README.md](./README.md) - Usage documentation
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [Constitution](./.specify/memory/constitution.md) - Detailed principles
