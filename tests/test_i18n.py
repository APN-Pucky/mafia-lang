import json
from pathlib import Path

import pytest

DATA_DIR = Path(__file__).parent.parent / "data"
SUPPORTED_LANGS = ["en", "uk", "ru", "de"]


def load_lang(lang):
    with open(DATA_DIR / "i18n" / f"{lang}.json", encoding="utf-8") as f:
        return json.load(f)


def load_gestures():
    with open(DATA_DIR / "gestures" / "gestures.json", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def all_langs():
    return {lang: load_lang(lang) for lang in SUPPORTED_LANGS}


def test_all_language_files_exist(all_langs):
    assert set(all_langs.keys()) == set(SUPPORTED_LANGS)


def test_all_languages_have_identical_keys(all_langs):
    key_sets = {lang: set(d.keys()) for lang, d in all_langs.items()}
    en_keys = key_sets["en"]
    for lang, keys in key_sets.items():
        assert keys == en_keys, (
            f"{lang}.json keys differ from en.json: "
            f"missing={en_keys - keys}, extra={keys - en_keys}"
        )


def test_no_empty_translations(all_langs):
    for lang, d in all_langs.items():
        empty = [k for k, v in d.items() if not isinstance(v, str) or not v.strip()]
        assert not empty, f"{lang}.json has empty values for keys: {empty}"


def test_every_gesture_has_name_and_description_in_every_language(all_langs):
    gestures = load_gestures()
    for lang, d in all_langs.items():
        for g in gestures:
            for suffix in ("name", "description"):
                key = f"gestures.{g['id']}.{suffix}"
                assert key in d, f"missing {key} in {lang}.json"


def test_every_category_is_translated(all_langs):
    gestures = load_gestures()
    categories = {g["category"] for g in gestures}
    for lang, d in all_langs.items():
        for cat in categories:
            assert f"categories.{cat}" in d, f"missing categories.{cat} in {lang}.json"
