#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$ROOT_DIR/terraform"

UI_PROJECT="token-analyzer-ui"
API_PROJECT="@text-analyzer-app/text-analyzer-api"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required but not found." >&2
  exit 1
fi

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform is required but not found." >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "aws cli is required but not found." >&2
  exit 1
fi

echo "Building UI ($UI_PROJECT)..."
pushd "$ROOT_DIR" >/dev/null
npx nx build "$UI_PROJECT"


echo "Building API ($API_PROJECT)..."
npx nx build "$API_PROJECT"


echo "Packaging Lambda..."
"$ROOT_DIR/scripts/package-api-lambda.sh"

popd >/dev/null

echo "Running Terraform..."
pushd "$TERRAFORM_DIR" >/dev/null
terraform init -input=false
terraform plan
terraform apply --auto-approve

FRONTEND_BUCKET_NAME="$(terraform output -raw frontend_bucket_name)"
if [[ -z "$FRONTEND_BUCKET_NAME" ]]; then
  echo "Terraform output frontend_bucket_name is empty." >&2
  exit 1
fi
popd >/dev/null

echo "Uploading UI to S3 bucket: $FRONTEND_BUCKET_NAME"
"$ROOT_DIR/scripts/upload-ui-to-s3.sh" "$FRONTEND_BUCKET_NAME"

echo "Done."
