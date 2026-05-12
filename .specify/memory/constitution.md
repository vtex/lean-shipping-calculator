<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0 (Initial constitution)

Added sections:
- Core Principles (5 principles)
- Technology Stack
- Development Workflow
- Governance

Templates status:
- .specify/templates/plan-template.md ✅ Compatible (uses generic Constitution Check)
- .specify/templates/spec-template.md ✅ Compatible (technology-agnostic)
- .specify/templates/tasks-template.md ✅ Compatible (generic task structure)

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

### II. Type Safety

All code MUST leverage TypeScript for compile-time safety.

- Public API functions MUST have explicit type annotations
- `any` type is prohibited in new code; existing uses MUST be replaced during refactoring
- Union types MUST be used instead of loose typing for constrained values (e.g., `'CHEAPEST' | 'FASTEST' | 'COMBINED'`)
- Type exports MUST accompany function exports for consumer type inference

**Rationale**: Type safety reduces integration bugs and improves developer experience for library consumers.

### III. Test Coverage (NON-NEGOTIABLE)

All features MUST have corresponding tests before merge.

- Unit tests MUST cover public API functions
- Edge cases (null inputs, empty arrays, boundary conditions) MUST be tested
- Tests MUST run in pre-push hooks via Husky
- Test failures MUST block merge

**Rationale**: As a shared utility library, regressions propagate to multiple consuming applications. Tests are the safety net.

### IV. Backward Compatibility

Breaking changes to the public API MUST follow semantic versioning and require explicit justification.

- MAJOR version bump required for: function signature changes, removed exports, behavior changes
- MINOR version bump for: new functions, new optional parameters
- PATCH version bump for: bug fixes, internal refactoring with no API change
- Deprecation warnings MUST precede removals by at least one minor version

**Rationale**: Downstream consumers depend on stable interfaces; unexpected breaks erode trust and cause production incidents.

### V. Simplicity

Prefer the simplest solution that meets requirements.

- YAGNI: Do not add functionality until it is needed
- Avoid abstractions until patterns repeat at least twice
- Prefer pure functions over stateful implementations
- Code MUST be readable without requiring extensive comments

**Rationale**: Complexity is the enemy of maintainability. Simple code is easier to test, debug, and evolve.

## Technology Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js / Browser (universal module)
- **Package Manager**: npm/yarn
- **Testing**: Jest (via `yarn --cwd react test`)
- **Linting**: ESLint with @vtex/eslint-config
- **Formatting**: Prettier with @vtex/prettier-config
- **Pre-commit/push**: Husky (lint + test)

**Constraints**:
- MUST maintain compatibility with both Node.js and browser environments
- MUST NOT introduce dependencies that increase bundle size significantly
- MUST follow VTEX coding standards

## Development Workflow

1. **Feature Development**:
   - Create feature branch from main
   - Write/update tests for new functionality
   - Implement feature
   - Ensure all tests pass locally (`yarn test`)
   - Ensure linting passes (`yarn lint`)

2. **Code Review**:
   - All changes require pull request review
   - Husky pre-push hooks MUST pass
   - CI checks MUST be green before merge

3. **Release**:
   - Follow semantic versioning
   - Update CHANGELOG.md with changes
   - Tag releases appropriately

## Governance

This constitution supersedes all other development practices for this repository.

- **Amendments**: Changes to this constitution require documentation of the change rationale, review by maintainers, and a version bump to the constitution itself.
- **Compliance**: All pull requests MUST verify compliance with these principles. Reviewers SHOULD reference specific principles when requesting changes.
- **Exceptions**: Violations of principles MUST be documented in the PR description with explicit justification. Exceptions do not set precedent.

**Version**: 1.0.0 | **Ratified**: 2026-05-12 | **Last Amended**: 2026-05-12
