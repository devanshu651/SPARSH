from pydantic import BaseModel


class Prediction(BaseModel):
    status: str = "unavailable"
    reason: str = "No validated model is configured."
    probability: float | None = None
    model_version: str | None = None
