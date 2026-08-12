#!/usr/bin/env bash
# Provision the dev container after creation.
# Mirrors what CI does (node-ci-v2 -> install, test:coverage) so a fresh
# container is immediately able to run lint and tests.
set -euo pipefail

echo "==> node $(node --version) / yarn $(yarn --version)"

echo "==> Installing root dependencies (lint + husky tooling)"
yarn install --frozen-lockfile

echo "==> Installing react/ dependencies (library source + jest)"
yarn --cwd react install --frozen-lockfile

if [ ! -f .env.local ] && [ -f .env.local.example ]; then
  cp .env.local.example .env.local
  echo "==> Created .env.local from example (fill in SONAR_TOKEN before running sonar)"
fi

echo "==> Ready. Try: yarn lint && yarn test"
