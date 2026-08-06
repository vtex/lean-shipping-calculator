# Dev container

A fully configured, containerized dev environment for `lean-shipping-calculator`. Runtime,
package manager, linters, and test tooling live inside Docker — nothing needs to be installed
on the host beyond Docker and an editor that speaks the
[Dev Containers spec](https://containers.dev/).

## Why

- **Parity with CI.** Node is pinned to `20-bookworm`, the exact tag used by the `node-ci-v2`
  pipeline in [`.vtex/deployment.yaml`](../.vtex/deployment.yaml). Yarn is pinned to Classic
  `1.22.x` to match `yarn.lock` v1.
- **One-command onboarding.** `post-create.sh` installs both dependency trees (root for
  lint/husky, `react/` for the library and Jest), so `yarn lint && yarn test` works immediately.
- **No host pollution.** No global Node versions, no JRE on the host for SonarQube scans.

## Contents

| File | Purpose |
|---|---|
| `devcontainer.json` | Container definition, VS Code extensions/settings, yarn cache volume |
| `Dockerfile` | Pinned Node + Yarn Classic, optional SonarQube scanner (bundles its own JRE) |
| `post-create.sh` | Installs root and `react/` dependencies; seeds `.env.local` when an example exists |

## Usage

1. Install Docker and the **Dev Containers** extension (VS Code) or use `devcontainer up`.
2. Open the repo → *Reopen in Container*.
3. Wait for `post-create.sh`, then:

```bash
yarn lint
yarn test
yarn test:coverage
```

## Options

Build args in `devcontainer.json`:

| Arg | Default | Notes |
|---|---|---|
| `NODE_VARIANT` | `20-bookworm` | Keep aligned with `nodeVersion` in `.vtex/deployment.yaml` |
| `YARN_VERSION` | `1.22.22` | Yarn Classic — do not move to Berry without migrating `yarn.lock` |
| `INSTALL_SONAR_SCANNER` | `true` | Set `false` for a smaller image if you never scan locally |

## Notes

- The yarn cache is a named volume (`lsc-yarn-cache`), so rebuilds stay fast.
- Local SonarQube scans need `SONAR_HOST_URL` and `SONAR_TOKEN` in `.env.local`
  (gitignored — never commit tokens).
- The scanner archive is picked from the image architecture (`linux-x64` on amd64,
  `linux-aarch64` on arm64) because its embedded JRE is not emulated across architectures.
- Husky hooks run inside the container as they do on the host; bypassing them with
  `--no-verify` is forbidden by [AGENTS.md](../AGENTS.md).
