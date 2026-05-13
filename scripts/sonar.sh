#!/bin/bash

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
  echo "📋 Loading configuration from .env.local..."
  export $(grep -v '^#' .env.local | xargs)
else
  echo "⚠️  .env.local not found. Copy .env.local.example to .env.local and configure your tokens."
  echo ""
  echo "   cp .env.local.example .env.local"
  echo ""
  exit 1
fi

# Validate required variables
if [ -z "$SONAR_HOST_URL" ]; then
  echo "❌ SONAR_HOST_URL is not set in .env.local"
  exit 1
fi

if [ -z "$SONAR_TOKEN" ]; then
  echo "❌ SONAR_TOKEN is not set in .env.local"
  exit 1
fi

echo "🔍 Running SonarQube analysis..."
echo "   Host: $SONAR_HOST_URL"
echo ""

# Build sonar-scanner arguments
SONAR_ARGS="-Dsonar.host.url=$SONAR_HOST_URL -Dsonar.token=$SONAR_TOKEN"

# Add organization if set (for SonarCloud)
if [ -n "$SONAR_ORGANIZATION" ]; then
  SONAR_ARGS="$SONAR_ARGS -Dsonar.organization=$SONAR_ORGANIZATION"
fi

# Run sonar-scanner (uses local CLI installation)
sonar-scanner $SONAR_ARGS

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SonarQube analysis complete!"
  echo "   View results at: ${SONAR_HOST_URL}dashboard?id=lean-shipping-calculator"
else
  echo ""
  echo "❌ SonarQube analysis failed"
  exit 1
fi
