"""Evaluation helpers; no clinical performance claims are inferred."""


def evaluate_predictions(expected: list[int], predicted: list[int]) -> dict:
    if len(expected) != len(predicted) or not expected:
        raise ValueError("Expected and predicted labels must have equal non-zero length")
    correct = sum(a == b for a, b in zip(expected, predicted))
    return {"sample_count": len(expected), "accuracy": correct / len(expected), "clinical_validity": "not_assessed"}
