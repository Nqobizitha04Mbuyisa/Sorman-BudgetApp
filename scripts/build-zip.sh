#!/usr/bin/env bash
# =============================================================================
#  Sorman — Distributable Zip Builder
# =============================================================================
#  Produces a clean, recruiter-friendly archive of the project at the repo root
#  as `Sorman-portfolio.zip`. Excludes build artefacts, dependencies, and
#  secret files.
#
#  Usage:
#     ./scripts/build-zip.sh
#
#  Requirements:
#     - bash, zip   (preinstalled on macOS/Linux; on Windows use Git Bash/WSL)
# =============================================================================

set -euo pipefail

# Resolve script dir & repo root regardless of where the script is invoked from
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUTPUT_NAME="Sorman-portfolio.zip"
OUTPUT_PATH="${ROOT_DIR}/${OUTPUT_NAME}"

# Color helpers
if [[ -t 1 ]]; then
  BLUE="\033[1;34m"; GREEN="\033[1;32m"; YELLOW="\033[1;33m"; RED="\033[1;31m"; RESET="\033[0m"
else
  BLUE=""; GREEN=""; YELLOW=""; RED=""; RESET=""
fi

log()  { printf "${BLUE}[build-zip]${RESET} %s\n" "$*"; }
ok()   { printf "${GREEN}[build-zip]${RESET} %s\n" "$*"; }
warn() { printf "${YELLOW}[build-zip]${RESET} %s\n" "$*"; }
fail() { printf "${RED}[build-zip]${RESET} %s\n" "$*" >&2; exit 1; }

# Pre-flight checks
command -v zip >/dev/null 2>&1 || fail "'zip' is not installed. Install it and retry."

cd "${ROOT_DIR}"

# Remove any previous archive
if [[ -f "${OUTPUT_PATH}" ]]; then
  warn "Removing existing ${OUTPUT_NAME}…"
  rm -f "${OUTPUT_PATH}"
fi

# Items to include (relative to repo root). Any path missing is silently skipped.
INCLUDE_PATHS=(
  "backend-java"
  "backend"
  "frontend"
  "scripts"
  "docs"
  "README.md"
  "LICENSE"
  ".gitignore"
)

# Patterns to exclude from the archive
EXCLUDES=(
  # Dependencies / build outputs
  "*/node_modules/*"  "node_modules/*"
  "*/target/*"        "target/*"
  "*/build/*"
  "*/dist/*"
  "*/.next/*"
  "*/.parcel-cache/*"
  "*/.gradle/*"
  "*/.mvn/*"

  # Python caches & virtualenvs
  "*/__pycache__/*"   "__pycache__/*"
  "*.pyc" "*.pyo" "*.pyd"
  "*/.pytest_cache/*"
  "*/.mypy_cache/*"
  "*/.ruff_cache/*"
  "*/.venv/*"         "*/venv/*"   "*/env/*"

  # VCS / IDE
  "*/.git/*"          ".git/*"
  "*/.idea/*"         ".idea/*"
  "*/.vscode/*"       ".vscode/*"
  "*.iml"

  # OS junk
  "*/.DS_Store"       ".DS_Store"
  "*/Thumbs.db"

  # Secrets — never bundle real env files
  "*/.env"            ".env"
  "*/.env.local"      ".env.local"
  "*/.env.*.local"

  # Logs
  "*.log"
  "*/logs/*"

  # Test outputs
  "*/test_reports/*"  "test_reports/*"

  # Previously-built archives
  "finova-portfolio.zip"
  "*.zip"
)

# Build the include list, dropping anything that doesn't exist locally
EXISTING_INCLUDES=()
for p in "${INCLUDE_PATHS[@]}"; do
  if [[ -e "${p}" ]]; then
    EXISTING_INCLUDES+=("${p}")
  else
    warn "Skipping missing path: ${p}"
  fi
done

if [[ ${#EXISTING_INCLUDES[@]} -eq 0 ]]; then
  fail "Nothing to package — none of the expected paths exist."
fi

log "Project root:  ${ROOT_DIR}"
log "Output:        ${OUTPUT_PATH}"
log "Including:     ${EXISTING_INCLUDES[*]}"

# Build the zip
zip -r "${OUTPUT_PATH}" "${EXISTING_INCLUDES[@]}" -x "${EXCLUDES[@]}" -q

# Summary
SIZE=$(du -h "${OUTPUT_PATH}" | awk '{print $1}')
FILE_COUNT=$(unzip -l "${OUTPUT_PATH}" | tail -1 | awk '{print $2}')

echo ""
ok "Archive created successfully"
printf "       ${GREEN}→${RESET} %s\n" "${OUTPUT_PATH}"
printf "       ${GREEN}→${RESET} %s (%s files)\n" "${SIZE}" "${FILE_COUNT}"
echo ""
log "Next steps:"
echo "   1. Verify contents:   unzip -l ${OUTPUT_NAME} | less"
echo "   2. Test extraction:   unzip ${OUTPUT_NAME} -d /tmp/Sorman && ls /tmp/Sorman"
echo "   3. Share it as part of your portfolio submission ✨"
