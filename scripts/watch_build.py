#!/usr/bin/env python3
"""Rebuild the static site (pages/) whenever source files change.

Usage: poetry run python scripts/watch_build.py
"""
import sys
import time
from pathlib import Path

from watchfiles import watch

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

from build import build  # noqa: E402

WATCH_DIRS = [ROOT / "data", ROOT / "web-simulator", ROOT / "templates"]


def main():
    print(f"[watch_build] rebuilding once to start...")
    build("*")
    print(f"[watch_build] watching {', '.join(str(d) for d in WATCH_DIRS)} for changes (Ctrl+C to stop)")
    for changes in watch(*WATCH_DIRS, recursive=True):
        ts = time.strftime("%H:%M:%S")
        print(f"[watch_build] {ts} change detected ({len(changes)} file(s)), rebuilding...")
        try:
            build("*")
            print(f"[watch_build] {ts} rebuild OK")
        except Exception as e:
            print(f"[watch_build] {ts} rebuild FAILED: {e}")


if __name__ == "__main__":
    main()
