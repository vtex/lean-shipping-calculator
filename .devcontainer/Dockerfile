# Dev container image for lean-shipping-calculator.
#
# Node version is pinned to the same tag used by CI
# (.vtex/deployment.yaml -> pipelines[node-ci-v2].parameters.nodeVersion: 20-bookworm)
# so "works on my machine" and "works on the pipeline" mean the same thing.
ARG NODE_VARIANT=20-bookworm
FROM mcr.microsoft.com/devcontainers/javascript-node:${NODE_VARIANT}

# Yarn Classic is the package manager of record for this repo (yarn.lock v1).
# Pin it explicitly so the container never drifts to Yarn Berry.
ARG YARN_VERSION=1.22.22
RUN npm install --global "yarn@${YARN_VERSION}" --force \
  && yarn --version

# SonarQube scanner (optional): SonarQube runs in CI via node-ci-v2 and local
# scans are documented in CLAUDE.md. The scanner is a JVM tool, so a headless
# JRE is required. Build with INSTALL_SONAR_SCANNER=false for a lighter image.
ARG INSTALL_SONAR_SCANNER=true
ARG SONAR_SCANNER_VERSION=6.2.1.4610
RUN if [ "${INSTALL_SONAR_SCANNER}" = "true" ]; then \
      apt-get update \
      && apt-get install -y --no-install-recommends default-jre-headless unzip \
      && rm -rf /var/lib/apt/lists/* \
      && curl -fsSL -o /tmp/sonar-scanner.zip \
        "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-x64.zip" \
      && unzip -q /tmp/sonar-scanner.zip -d /opt \
      && mv "/opt/sonar-scanner-${SONAR_SCANNER_VERSION}-linux-x64" /opt/sonar-scanner \
      && ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner \
      && rm /tmp/sonar-scanner.zip; \
    fi

# Keep the yarn cache at a stable path so it can be mounted as a named volume
# (see devcontainer.json -> mounts) and survive container rebuilds.
ENV YARN_CACHE_FOLDER=/home/node/.cache/yarn
RUN mkdir -p "${YARN_CACHE_FOLDER}" && chown -R node:node /home/node/.cache

USER node
