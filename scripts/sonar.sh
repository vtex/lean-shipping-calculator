#!/usr/bin/env bash
# Run a local SonarQube analysis.
#
# Reads SONAR_HOST_URL and SONAR_TOKEN from the environment, falling back to
# .env.local (gitignored). Scanner configuration lives in sonar-project.properties.
#
# Usage:
#   yarn sonar          # scan only (expects coverage to already exist)
#   yarn sonar:local    # coverage + scan
#   yarn sonar -- -Dsonar.verbose=true   # extra scanner flags are forwarded
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env.local ]; then
  echo "==> Loading .env.local"
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
fi

: "${SONAR_HOST_URL:?SONAR_HOST_URL is not set. Copy .env.local.example to .env.local and fill it in.}"
: "${SONAR_TOKEN:?SONAR_TOKEN is not set. Copy .env.local.example to .env.local and fill it in.}"

if ! command -v sonar-scanner >/dev/null 2>&1; then
  echo "error: sonar-scanner not found in PATH." >&2
  echo "       Use the dev container (.devcontainer/), which installs it, or install the" >&2
  echo "       SonarScanner CLI manually: https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/" >&2
  exit 127
fi

COVERAGE_REPORT="react/coverage/lcov.info"
if [ ! -f "$COVERAGE_REPORT" ]; then
  echo "warning: $COVERAGE_REPORT not found — the scan will report 0% coverage." >&2
  echo "         Run 'yarn test:coverage' first, or use 'yarn sonar:local'." >&2
fi

echo "==> Scanning against ${SONAR_HOST_URL}"
exec sonar-scanner \
  "-Dsonar.host.url=${SONAR_HOST_URL}" \
  "-Dsonar.token=${SONAR_TOKEN}" \
  "$@"
