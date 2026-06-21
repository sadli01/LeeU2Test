# LeeU2 Portfolio

LeeU2 is a static portfolio website for Makeup&Hair, Photo, Portrait, Secret,
Video, Blog, and Contact content.

The website is data-driven. Gallery content, covers, visibility, and ordering
are managed through JSON files in `assets/data/` and the local visual editor.

## Local Preview

```bash
python3 scripts/admin_server.py
```

Open:

- Website: `http://localhost:8000`
- Editor: `http://localhost:8000/admin/gallery-editor.html`

Stop the server with `Ctrl + C`.

## Validation

```bash
node scripts/validate-content.js
node scripts/sync-project-media.js --dry-run
```

## Image Storage and Cloudflare R2

Local files in `local/original-images/` are the image source of truth and
retain the complete directory tree. This directory is ignored by Git. Images
are synchronized to the Cloudflare R2 bucket
`leeu2-images`, while the website loads public images from
`https://img.leeu2.com`.

- `mediaDir` keeps the logical `/pic/...` path; local tools map it to `local/original-images/...`.
- Covers, project images, film covers, and the Contact image use R2 URLs.
- Use `rclone copy` for normal additions and replacements; it does not delete remote files.
- Use `rclone sync` only when R2 must exactly mirror local files, after checking a dry run.

```bash
# Generate responsive 1280px and 2560px image variants
node scripts/generate-image-variants.js

# Upload variants with long-lived browser/CDN cache metadata
bash scripts/upload-image-variants.sh

# Preview and upload normal image updates
rclone copy local/original-images r2:leeu2-images --exclude '**/.DS_Store' --dry-run
rclone copy local/original-images r2:leeu2-images --exclude '**/.DS_Store' --progress

# Refresh content data when project media membership changes
node scripts/sync-project-media.js --dry-run
node scripts/sync-project-media.js
node scripts/validate-content.js
```

See [docs/IMAGE_STORAGE_AND_R2.md](docs/IMAGE_STORAGE_AND_R2.md) for the full
path mapping, update workflow, deletion procedure, checks, and security notes.

See [docs/PROJECT_FILE_LAYOUT.md](docs/PROJECT_FILE_LAYOUT.md) for the boundary
between GitHub-published source files and local-only assets.

Full project structure, content-management instructions, and editor usage are
documented in [docs/README.md](docs/README.md).
