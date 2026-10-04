from app.core.config import Settings


def test_cors_is_closed_when_no_origins_are_configured():
    settings = Settings(_env_file=None)
    assert settings.cors_origins == []


def test_cors_uses_only_explicitly_configured_origins(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "https://sparsh.example, http://localhost:5173")
    settings = Settings(_env_file=None)
    assert settings.cors_origins == ["https://sparsh.example", "http://localhost:5173"]
