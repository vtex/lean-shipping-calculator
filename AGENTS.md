# Lean Shipping Calculator

Utility library for calculating "lean" shipping options in VTEX checkout. This file is the entry point for AI agents (Claude Code, Cursor, Copilot) working in this repository.

## Golden Path mode

This repo follows the **VTEX SDLC Golden Path (GenAI era)** with the full SpecKit setup committed.

- **Default flow:** **SDD Lite** — for bug fixes, small features, and isolated changes. Use the `specification` skill to draft a spec, then `implementing` to apply it. The constitution still applies as a source of truth, but `.specify/templates/*` and `speckit-*` slash commands are optional.
- **When to escalate to SDD Full:** changes that touch the public API (`react/index.js`), introduce a new module, or affect any consumer of this lib (`checkout-ui`, `shipping-manager`). Use the full `speckit-*` flow: constitution → specify → plan → tasks → implement.
- **Lifecycle:** `maintenance` (see `.vtex/catalog-info.yaml`). The team prioritizes correctness and stability over new features.

## Sources of truth

Canonical references for both humans and agents:

- [README.md](./README.md) — usage and public API documentation
- [.specify/memory/constitution.md](./.specify/memory/constitution.md) — non-negotiable engineering principles (current version 1.2.0)
- [.vtex/catalog-info.yaml](./.vtex/catalog-info.yaml) — service metadata, ownership (`te-0001`), system (`checkout`)
- [.vtex/deployment.yaml](./.vtex/deployment.yaml) — CI pipeline (`dkcicd` / `node-ci-v2` + SonarQube)
- [CHANGELOG.md](./CHANGELOG.md) — release history (Keep a Changelog format)
- [manifest.json](./manifest.json) — VTEX IO manifest (vendor, version, builders)
- External design doc: <https://docs.google.com/document/d/1tDhV1ZOhHhwRYXRGcYmsLvNjsc2pzfQGHKePV68BEKg>

## Verified commands

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

## Expected skills

Agents working in this repo should prefer the following skills (installed in [.agents/skills/](./.agents/skills/)):

| Skill | Purpose |
|-------|---------|
| `specification` | Author a Lite SDD spec from a Jira task or feature description (default flow) |
| `implementing` | Implement code from an approved Lite SDD spec |
| `speckit-constitution` | Read/update [`.specify/memory/constitution.md`](./.specify/memory/constitution.md) |
| `speckit-specify` | Create a Full SDD feature spec under `specs/<feature>/spec.md` |
| `speckit-plan` | Generate the implementation plan for an approved spec |
| `speckit-tasks` | Break the plan into ordered tasks |
| `speckit-implement` | Execute the tasks list |
| `speckit-analyze` | Cross-check spec / plan / tasks consistency before merge |
| `speckit-clarify` | Surface ambiguities in a spec |
| `speckit-git-*` | Branch / commit helpers wired into the SpecKit flow |

**Recommended MCPs:**

- **GitHub MCP** — when a change may affect public-API consumers (`checkout-ui`, `shipping-manager`). Use it to inspect downstream usage before altering exports in [react/index.js](./react/index.js).
- **Atlassian MCP** (optional) — when implementing a Jira-tracked task and the agent should sync status.

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

## Autonomy limits

The agent **MUST NOT** modify the following without explicit human approval:

- [manifest.json](./manifest.json) — version, vendor, builders (controls VTEX IO deploy).
- [.vtex/deployment.yaml](./.vtex/deployment.yaml) — CI pipeline configuration (dkcicd / SonarQube).
- [.vtex/catalog-info.yaml](./.vtex/catalog-info.yaml) — service metadata, ownership, lifecycle.
- Public API exported from [react/index.js](./react/index.js) — breaking changes require coordination with `checkout-ui` and `shipping-manager` owners.
- Production dependencies in [react/package.json](./react/package.json) — adding / removing / upgrading affects downstream apps.
- [publish-release.sh](./publish-release.sh) — release script.
- Husky hooks in [package.json](./package.json) — bypassing pre-commit/pre-push with `--no-verify` is forbidden.
- [.specify/memory/constitution.md](./.specify/memory/constitution.md) — amendments require a version bump and human review (see Governance section in the constitution).

For everything else (refactors inside `react/`, new tests, fixture extensions, doc updates, dev-dependency tweaks scoped to tests), the agent may proceed and open a PR for human review.

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
