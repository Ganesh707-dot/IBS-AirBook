#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Building Angular UI"
cd "$ROOT/frontend/airbook-ui"
npm ci --no-audit --no-fund
npm run build

echo "==> Embedding UI into Spring Boot static resources"
STATIC="$ROOT/backend/src/main/resources/static"
rm -rf "$STATIC"
mkdir -p "$STATIC"
cp -r dist/airbook-ui/browser/* "$STATIC/"

echo "==> Building Spring Boot API"
cd "$ROOT/backend"
if [ -x ./mvnw ]; then
  ./mvnw -q -B -DskipTests package
else
  mvn -q -B -DskipTests package
fi

echo "==> Build complete: backend/target/airbook-api-1.0.0.jar"
