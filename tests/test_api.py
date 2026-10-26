import os
import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("ALLOWED_ORIGIN", "*")

from app import app  # noqa: E402

client = TestClient(app)


def test_root_serves_index_html():
    resp = client.get("/")
    assert resp.status_code == 200
    assert "text/html" in resp.headers["content-type"]
    assert "CWASAAvatar" in resp.text


def test_root_is_not_rtl_arabic():
    resp = client.get("/")
    assert 'dir="rtl"' not in resp.text
    assert 'lang="ar"' not in resp.text
    assert "Mafia Signs" in resp.text


def test_embed_route_ok():
    resp = client.get("/embed")
    assert resp.status_code == 200
    assert "text/html" in resp.headers["content-type"]


def test_embed_placeholder_is_replaced():
    resp = client.get("/embed")
    assert "__ALLOWED_ORIGIN__" not in resp.text


def test_embed_injects_wildcard_origin():
    resp = client.get("/embed")
    assert 'const ALLOWED_ORIGIN = "*"' in resp.text


def test_embed_injects_custom_origin(monkeypatch):
    monkeypatch.setenv("ALLOWED_ORIGIN", "https://my-frontend.com")
    from pathlib import Path
    html = (Path(__file__).parent.parent / "templates" / "embed.html").read_text(encoding="utf-8")
    html = html.replace("__ALLOWED_ORIGIN__", "https://my-frontend.com")
    assert 'const ALLOWED_ORIGIN = "https://my-frontend.com"' in html
    assert "__ALLOWED_ORIGIN__" not in html


def test_embed_has_cwasa_div():
    resp = client.get("/embed")
    assert "CWASAAvatar" in resp.text


def test_embed_loads_cwasa_js():
    resp = client.get("/embed")
    assert "allcsa.js" in resp.text


def test_static_favicon():
    resp = client.get("/favicon.svg")
    assert resp.status_code == 200
    assert "svg" in resp.headers["content-type"]


def test_static_cwasa_css():
    resp = client.get("/cwa/cwasa.css")
    assert resp.status_code == 200


def test_static_cwasa_js():
    resp = client.get("/cwa/allcsa.js")
    assert resp.status_code == 200


def test_static_gestures_json():
    resp = client.get("/gestures/gestures.json")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert all("id" in g and "category" in g for g in data)


def test_static_i18n_files():
    for lang in ("en", "uk", "ru", "de"):
        resp = client.get(f"/i18n/{lang}.json")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, dict)
        assert "app.title" in data


def test_static_sigml_file():
    resp = client.get("/sigml/citizen.sigml")
    assert resp.status_code == 200


def test_cors_header_present():
    resp = client.get("/", headers={"Origin": "http://localhost:3000"})
    assert "access-control-allow-origin" in resp.headers


def test_playground_route_ok():
    resp = client.get("/playground")
    assert resp.status_code == 200
    assert "text/html" in resp.headers["content-type"]


def test_playground_has_cwasa_div():
    resp = client.get("/playground")
    assert "CWASAAvatar" in resp.text


def test_playground_has_sigml_textarea():
    resp = client.get("/playground")
    assert "sigmlInput" in resp.text


def test_unknown_route_returns_404():
    resp = client.get("/does-not-exist-xyz")
    assert resp.status_code == 404
