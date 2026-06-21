#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -d local/image-variants/small || ! -d local/image-variants/large ]]; then
  echo "Image variants are missing. Run: node scripts/generate-image-variants.js" >&2
  exit 1
fi

rclone copy local/image-variants r2:leeu2-images/optimized \
  --exclude '**/.DS_Store' \
  --metadata \
  --metadata-set 'cache-control=public, max-age=31536000, immutable' \
  --transfers 2 \
  --checkers 4 \
  --progress
