# Product artifacts

Golden path product documentation for `lean-shipping-calculator`. Read in this order:

| File | Answers | Horizon |
|---|---|---|
| [product-vision.md](./product-vision.md) | Where are we going, and why does this library exist? | 3–5 years |
| [one-pager.md](./one-pager.md) | Should we invest in this specific idea? | per initiative |
| [prd.md](./prd.md) | What exact components, rules, and logic must be built? | per release |

Downstream: an approved PRD feeds the SDD flow — `specification` (SDD Lite) or
`speckit-specify` → `speckit-plan` → `speckit-tasks` (SDD Full). See [CLAUDE.md](../../CLAUDE.md).

## Conventions

- `[NEEDS VALIDATION]` marks a statement inferred by engineering from code and repo metadata
  that has not been confirmed by product. Resolve or remove it — do not let it rot.
- Every artifact ends with a **Provenance** section listing the repo files it was derived from.
  If you change one of those files and the artifact no longer matches, the artifact is stale.
- `one-pager.md` is currently a *retrospective* pitch for the shipped lean-shipping concept.
  Copy it as the template for a new initiative rather than overwriting it.
