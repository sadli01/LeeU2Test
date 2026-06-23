#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

dry_run=false
upload=true
publish_github=false
include_existing_changes=false
commit_message="Update portfolio content"
publish_branch=""

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      dry_run=true
      ;;
    --no-upload)
      upload=false
      ;;
    --github)
      publish_github=true
      ;;
    --include-existing-changes)
      include_existing_changes=true
      ;;
    --commit-message=*)
      commit_message="${arg#*=}"
      ;;
    *)
      echo "Unknown option: $arg" >&2
      echo "Usage: bash scripts/update-portfolio.sh [--dry-run] [--no-upload] [--github] [--include-existing-changes] [--commit-message=TEXT]" >&2
      exit 2
      ;;
  esac
done

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick is required. Install it with: brew install imagemagick" >&2
  exit 1
fi

if [[ "$upload" == true ]] && ! command -v rclone >/dev/null 2>&1; then
  echo "rclone is required for upload. Install/configure rclone or use --no-upload." >&2
  exit 1
fi

if [[ "$publish_github" == true ]]; then
  if ! command -v gh >/dev/null 2>&1; then
    echo "GitHub CLI is required. Install it with: brew install gh" >&2
    exit 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "GitHub CLI is not authenticated. Run: gh auth login" >&2
    exit 1
  fi
fi

if [[ "$dry_run" == true ]]; then
  echo "== Preview JPG/JPEG conversion =="
  node scripts/convert-jpg-to-webp.js --dry-run

  echo
  echo "== Preview content synchronization =="
  node scripts/sync-project-media.js --create-missing --dry-run

  if [[ "$upload" == true ]]; then
    echo
    echo "== Preview current original-image upload =="
    rclone copy local/original-images r2:leeu2-images \
      --exclude '.DS_Store' \
      --exclude '**/.DS_Store' \
      --exclude '*.jpg' \
      --exclude '*.jpeg' \
      --exclude '*.JPG' \
      --exclude '*.JPEG' \
      --dry-run

    if [[ -d local/image-variants ]]; then
      echo
      echo "== Preview current responsive-image upload =="
      rclone copy local/image-variants r2:leeu2-images/optimized \
        --exclude '.DS_Store' \
        --exclude '**/.DS_Store' \
        --metadata \
        --metadata-set 'cache-control=public, max-age=31536000, immutable' \
        --dry-run
    fi
  fi

  if [[ "$publish_github" == true ]]; then
    echo
    echo "== Preview GitHub publication =="
    echo "Would create a codex/portfolio-update-* branch, commit generated changes,"
    echo "push it to origin, open a pull request, and merge it into main."
    if [[ "$include_existing_changes" == true ]]; then
      echo "Existing working-tree changes would also be included in the commit."
    fi
  fi

  echo
  echo "Dry run complete. No files, content data, or remote objects were changed."
  exit 0
fi

if [[ "$publish_github" == true ]]; then
  if [[ "$(git branch --show-current)" != "main" ]]; then
    echo "GitHub publication must start from the main branch." >&2
    exit 1
  fi
  if [[ "$include_existing_changes" != true && -n "$(git status --porcelain --untracked-files=all)" ]]; then
    echo "GitHub publication requires a clean working tree before the update starts." >&2
    echo "Commit, stash, or remove the existing changes, then run the command again." >&2
    echo "If all current changes belong to this release, add: --include-existing-changes" >&2
    exit 1
  fi

  echo "== Prepare GitHub publication branch =="
  if [[ "$include_existing_changes" == true ]]; then
    echo "Including existing working-tree changes in this release."
  else
    git pull --ff-only origin main
  fi
  publish_branch="codex/portfolio-update-$(date +%Y%m%d-%H%M%S)"
  git switch -c "$publish_branch"
fi

echo "== Convert JPG/JPEG sources to WebP =="
node scripts/convert-jpg-to-webp.js

echo
echo "== Create or update portfolio content =="
node scripts/sync-project-media.js --create-missing

echo
echo "== Generate responsive WebP variants =="
node scripts/generate-image-variants.js

echo
echo "== Validate content =="
node scripts/validate-content.js

if [[ "$upload" == false ]]; then
  echo
  echo "Remote image upload skipped because --no-upload was used."
else
  echo
  echo "== Upload original WebP images to Cloudflare R2 =="
  rclone copy local/original-images r2:leeu2-images \
    --exclude '.DS_Store' \
    --exclude '**/.DS_Store' \
    --exclude '*.jpg' \
    --exclude '*.jpeg' \
    --exclude '*.JPG' \
    --exclude '*.JPEG' \
    --transfers 2 \
    --checkers 4 \
    --progress

  echo
  echo "== Upload responsive images to Cloudflare R2 =="
  bash scripts/upload-image-variants.sh
fi

if [[ "$publish_github" == true ]]; then
  echo
  echo "== Publish changes through GitHub =="
  if [[ -z "$(git status --porcelain --untracked-files=all)" ]]; then
    echo "No Git-tracked content changed; no pull request is needed."
    git switch main
    git branch -D "$publish_branch"
  else
    git add -A
    git commit -m "$commit_message"
    git push -u origin "$publish_branch"

    pr_body_file="$(mktemp)"
    {
      echo "## What changed"
      echo
      echo "- Converted new JPG/JPEG portfolio images to WebP."
      echo "- Updated portfolio content and generated responsive image variants."
      if [[ "$upload" == true ]]; then
        echo "- Uploaded image changes to Cloudflare R2."
      fi
      echo
      echo "## Validation"
      echo
      echo "- \`node scripts/validate-content.js\`"
      echo "- Portfolio update pipeline completed successfully."
    } >"$pr_body_file"

    pr_url="$(
      gh pr create \
        --base main \
        --head "$publish_branch" \
        --title "$commit_message" \
        --body-file "$pr_body_file"
    )"
    rm -f "$pr_body_file"

    gh pr merge "$pr_url" --merge --delete-branch
    git switch main
    git pull --ff-only origin main
    git branch -D "$publish_branch" 2>/dev/null || true
    echo "Merged into main: $pr_url"
  fi
fi

echo
echo "Portfolio update complete."
