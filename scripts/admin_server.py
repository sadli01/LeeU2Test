#!/usr/bin/env python3
import hashlib
import json
import mimetypes
import re
import subprocess
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parents[1]
CACHE_DIR = ROOT / ".cache" / "editor-thumbs"
LOCAL_MEDIA_ROOT = ROOT / "local" / "original-images"
IMAGE_ORIGIN = "https://img.leeu2.com"
ALLOWED_FILES = {
    "projects.json": ROOT / "assets" / "data" / "projects.json",
    "films.json": ROOT / "assets" / "data" / "films.json",
    "blogs.json": ROOT / "assets" / "data" / "blogs.json",
}

IMAGE_EXTENSIONS = {".webp", ".jpg", ".jpeg", ".png"}


class ReusableThreadingHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True


class AdminHandler(SimpleHTTPRequestHandler):
    cache_control = "no-store"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", self.cache_control)
        self.cache_control = "no-store"
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/admin/thumb":
            self.send_thumb(parse_qs(parsed.query))
            return
        if parsed.path == "/admin/list-images":
            self.send_image_list(parse_qs(parsed.query))
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/admin/save-data":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            filename = payload.get("filename")
            content = payload.get("content")

            if filename not in ALLOWED_FILES:
                raise ValueError("只允许保存 projects.json、films.json、blogs.json")

            # Parse once through json.dumps to reject unsupported values and keep formatting stable.
            formatted = json.dumps(content, ensure_ascii=False, indent=2) + "\n"
            json.loads(formatted)
            ALLOWED_FILES[filename].write_text(formatted, encoding="utf-8")
            self.send_json(200, {"ok": True, "path": str(ALLOWED_FILES[filename].relative_to(ROOT))})
        except Exception as exc:
            self.send_json(400, {"ok": False, "error": str(exc)})

    def send_thumb(self, query):
        try:
            src = query.get("src", [""])[0]
            size = int(query.get("size", ["160"])[0])
            size = max(48, min(size, 420))
            if src.startswith(f"{IMAGE_ORIGIN}/"):
                src = f"/pic/{src[len(IMAGE_ORIGIN) + 1:]}"
            if not src.startswith(("/pic/", "/assets/")):
                raise ValueError("invalid image path")

            if src.startswith("/pic/"):
                source = (LOCAL_MEDIA_ROOT / src[len("/pic/"):]).resolve()
                allowed_root = LOCAL_MEDIA_ROOT
            else:
                source = (ROOT / src.lstrip("/")).resolve()
                allowed_root = ROOT
            if allowed_root not in source.parents or not source.exists():
                raise ValueError("image not found")

            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            key = hashlib.sha1(f"{source}:{source.stat().st_mtime_ns}:{size}".encode("utf-8")).hexdigest()
            thumb = CACHE_DIR / f"{key}.jpg"
            if not thumb.exists():
                subprocess.run(
                    [
                        "sips",
                        "-s",
                        "format",
                        "jpeg",
                        "-s",
                        "formatOptions",
                        "18",
                        "-Z",
                        str(size),
                        str(source),
                        "--out",
                        str(thumb),
                    ],
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )

            body = thumb.read_bytes()
            self.cache_control = "public, max-age=31536000, immutable"
            self.send_response(200)
            self.send_header("Content-Type", mimetypes.guess_type(str(thumb))[0] or "image/jpeg")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception:
            self.send_error(404)

    def send_image_list(self, query):
        try:
            media_dir = query.get("dir", [""])[0]
            if not media_dir.startswith("/pic/"):
                raise ValueError("invalid media directory")

            directory = (LOCAL_MEDIA_ROOT / media_dir[len("/pic/"):]).resolve()
            if LOCAL_MEDIA_ROOT not in directory.parents or not directory.is_dir():
                raise ValueError("media directory not found")

            images = []
            for file_path in sorted(directory.iterdir(), key=lambda item: natural_key(item.name)):
                if not file_path.is_file() or file_path.suffix.lower() not in IMAGE_EXTENSIONS:
                    continue

                width, height = read_dimensions(file_path)
                orientation = "landscape" if width >= height else "portrait"
                relative_src = str(file_path.relative_to(LOCAL_MEDIA_ROOT)).replace("\\", "/")
                src = f"{IMAGE_ORIGIN}/{relative_src}"
                images.append(
                    {
                        "src": src,
                        "alt": file_path.stem,
                        "orientation": orientation,
                        "aspectRatio": "3 / 2" if orientation == "landscape" else "2 / 3",
                    }
                )

            self.send_json(200, {"ok": True, "images": images})
        except Exception as exc:
            self.send_json(400, {"ok": False, "error": str(exc)})

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def natural_key(value):
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", value)]


def read_dimensions(file_path):
    output = subprocess.check_output(
        ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(file_path)],
        stderr=subprocess.DEVNULL,
        text=True,
    )
    width_match = re.search(r"pixelWidth:\s*(\d+)", output)
    height_match = re.search(r"pixelHeight:\s*(\d+)", output)
    if not width_match or not height_match:
        return 1, 1
    return int(width_match.group(1)), int(height_match.group(1))


def main():
    server = ReusableThreadingHTTPServer(("0.0.0.0", 8000), AdminHandler)
    print("LeeU2 admin server: http://localhost:8000/admin/gallery-editor.html")
    server.serve_forever()


if __name__ == "__main__":
    main()
