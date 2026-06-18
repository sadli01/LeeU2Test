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

Full project structure, content-management instructions, and editor usage are
documented in [docs/README.md](docs/README.md).
