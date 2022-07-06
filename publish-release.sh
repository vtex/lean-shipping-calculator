#!/bin/bash

unparsed_version=$(git describe --exact-match)

if [[ ! $? -eq 0 ]]; then
  echo "Nothing to publish, exiting.."
  exit 0;
fi

version=${unparsed_version//v}

if [[ -z "$NPM_TOKEN" ]]; then
  echo "No NPM_TOKEN, exiting.."
  exit 0;
fi

echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc

if [[ $version =~ -beta ]]; then
  echo "Publishing beta @vtex/lean-shipping-calculator@$version"

  yarn --cwd react publish --new-version $version --tag next
fi

if [[ ! $version =~ -beta ]]; then
  echo "Publishing stable @vtex/lean-shipping-calculator@$version"

  yarn --cwd react publish --new-version $version --tag latest
fi
