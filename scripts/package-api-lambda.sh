#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_NAME="@text-analyzer-app/text-analyzer-api"
DIST_DIR="$ROOT_DIR/apps/text-analyzer-api/dist"
ZIP_PATH="$DIST_DIR/lambda.zip"

npx nx run "$PROJECT_NAME":prune

pushd "$DIST_DIR" >/dev/null
npm ci --omit=dev
rm -f "$ZIP_PATH"

if command -v zip >/dev/null 2>&1; then
	zip -r "$ZIP_PATH" .
elif command -v powershell.exe >/dev/null 2>&1; then
	POWERSHELL_WORKDIR=""
	POWERSHELL_ZIP_PATH=""
	if command -v cygpath >/dev/null 2>&1; then
		POWERSHELL_WORKDIR="$(cygpath -w "$DIST_DIR")"
		POWERSHELL_ZIP_PATH="$(cygpath -w "$ZIP_PATH")"
	elif pwd -W >/dev/null 2>&1; then
		POWERSHELL_WORKDIR="$(pwd -W)"
		POWERSHELL_ZIP_PATH="${ZIP_PATH//\\//}"
	fi
	if [[ -n "$POWERSHELL_WORKDIR" && -n "$POWERSHELL_ZIP_PATH" ]]; then
		powershell.exe -NoProfile -Command "Set-Location -LiteralPath '$POWERSHELL_WORKDIR'; Compress-Archive -Path '*' -DestinationPath '$POWERSHELL_ZIP_PATH' -Force"
	else
		echo "Unable to resolve Windows paths for PowerShell zip creation." >&2
		exit 1
	fi
elif command -v tar >/dev/null 2>&1; then
	# tar -a may produce a non-zip archive depending on tar implementation.
	# Prefer it only as a last resort.
	tar -a -c -f "$ZIP_PATH" .
else
	echo "No zip tool found (zip/tar/powershell)." >&2
	exit 1
fi
popd >/dev/null

echo "Created Lambda package: $ZIP_PATH"
