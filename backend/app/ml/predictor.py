"""Model interface and safe default. Production remains rules-only by default."""
from app.ml.schemas import Prediction


class Predictor:
    def predict(self, features: dict) -> Prediction:
        raise NotImplementedError


class UnavailablePredictor(Predictor):
    def predict(self, features: dict) -> Prediction:
        return Prediction()
