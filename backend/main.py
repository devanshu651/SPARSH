from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import centres, children, screenings, referrals, users


app = FastAPI(
    title="SPARSH API",
    version="0.1.0",
    description="Developmental screening backend for Anganwadi centres.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/v1")
app.include_router(centres.router, prefix="/api/v1")
app.include_router(children.router, prefix="/api/v1")
app.include_router(screenings.router, prefix="/api/v1")
app.include_router(referrals.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
