import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"


def load_gestures():
    with open(DATA_DIR / "gestures" / "gestures.json", encoding="utf-8") as f:
        return json.load(f)


def test_gesture_ids_are_unique():
    gestures = load_gestures()
    ids = [g["id"] for g in gestures]
    assert len(ids) == len(set(ids))


def test_every_referenced_animation_file_exists():
    gestures = load_gestures()
    for g in gestures:
        if g["animation"]:
            path = DATA_DIR / g["animation"]
            assert path.is_file(), f"{g['id']} references missing animation file {g['animation']}"


def test_sigml_files_are_only_referenced_by_one_gesture():
    gestures = load_gestures()
    animations = [g["animation"] for g in gestures if g["animation"]]
    assert len(animations) == len(set(animations)), "a .sigml file is shared by more than one gesture id"


def test_every_gesture_has_a_category():
    gestures = load_gestures()
    for g in gestures:
        assert g.get("category"), f"{g['id']} has no category"
