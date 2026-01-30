#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $(basename "$0") <s3-bucket-name> [s3-prefix]" >&2
  exit 1
fi

BUCKET_NAME="$1"
PREFIX="${2:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$ROOT_DIR/apps/text-analyzer-ui/dist"

if [[ ! -d "$DIST_DIR" ]]; then
  echo "Build output not found at: $DIST_DIR" >&2
  echo "Run the UI build before uploading." >&2
  exit 1
fi

S3_PATH="s3://$BUCKET_NAME"
if [[ -n "$PREFIX" ]]; then
  S3_PATH="$S3_PATH/${PREFIX#/}"
fi

aws s3 sync "$DIST_DIR" "$S3_PATH" --delete --exclude "config.json"

echo "Upload complete: $S3_PATH"
