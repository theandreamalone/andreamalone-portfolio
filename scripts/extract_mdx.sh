#!/usr/bin/env bash
#
# extract_mdx.sh — dump case-study MDX section bodies as one JSON object.
#
# This repo stores case-study content as FLAT files under content/case-studies/
# (e.g. nethive-iq-context.mdx), not as one subdirectory per case study. So
# "$folder" here is derived, not a real directory: for each *.mdx file, we
# find the longest case-study slug (read from each `type: case_study` parent
# file's `slug:` field) that prefixes the filename, and treat the remainder as
# "$section". Files that don't match any known case-study slug fall back to
# using their own filename stem as $folder with section "block".
#
# Usage:
#   ./scripts/extract_mdx.sh [path/to/content/case-studies]
# Defaults to content/case-studies relative to the repo root.
#
# Requires: jq (for safe JSON string escaping).

set -euo pipefail

CONTENT_DIR="${1:-content/case-studies}"

if [ ! -d "$CONTENT_DIR" ]; then
  echo "extract_mdx.sh: no such directory: $CONTENT_DIR" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "extract_mdx.sh: this script requires jq (brew install jq)" >&2
  exit 1
fi

# Discover known case-study slugs from parent frontmatter (type: case_study).
case_study_slugs=()
for f in "$CONTENT_DIR"/*.mdx; do
  [ -e "$f" ] || continue
  if grep -q "^type: case_study" "$f"; then
    slug=$(grep -m1 "^slug:" "$f" | sed -E 's/^slug: *"?([^"]*)"?/\1/')
    case_study_slugs+=("$slug")
  fi
done

entries=()
for f in "$CONTENT_DIR"/*.mdx; do
  [ -e "$f" ] || continue

  # Skip parent case_study files — we only want section/block bodies.
  if grep -q "^type: case_study" "$f"; then
    continue
  fi

  stem=$(basename "$f" .mdx)

  # Match the longest known case-study slug that prefixes this filename.
  folder=""
  for slug in "${case_study_slugs[@]}"; do
    if [[ "$stem" == "$slug-"* ]] && [ ${#slug} -gt ${#folder} ]; then
      folder="$slug"
    fi
  done

  if [ -n "$folder" ]; then
    section="${stem#"$folder"-}"
  else
    folder="$stem"
    section="block"
  fi

  key="${folder}-${section}"

  # Body = everything after the closing '---' of frontmatter.
  body=$(awk '/^---$/{c++; next} c>=2' "$f")

  entries+=("$(jq -n --arg k "$key" --arg v "$body" '{($k): $v}')")
done

# Merge all single-key objects into one JSON object.
printf '%s\n' "${entries[@]}" | jq -s 'add // {}'
