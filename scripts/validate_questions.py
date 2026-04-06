from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def normalize_question_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    question_path = repo_root / "src" / "data" / "questions.json"
    questions = json.loads(question_path.read_text(encoding="utf-8"))

    errors: list[str] = []
    duplicate_tracker: dict[str, str] = {}
    ids: set[str] = set()

    if len(questions) < 300:
        errors.append(f"Banque trop petite: {len(questions)} questions.")

    for index, question in enumerate(questions, start=1):
        question_id = question.get("id", "")
        question_text = question.get("questionText", "").strip()
        options = question.get("options", [])
        correct_answers = question.get("correctAnswers", [])
        explanation = question.get("explanation", "").strip()
        reference = question.get("reference", "").strip()
        source_page = str(question.get("sourcePage", "")).strip()

        if not question_id:
            errors.append(f"Question #{index}: id manquant.")
        elif question_id in ids:
            errors.append(f"Question #{index}: id dupliqué ({question_id}).")
        else:
            ids.add(question_id)

        if not question_text:
            errors.append(f"Question {question_id or index}: intitulé vide.")
        else:
            normalized = normalize_question_text(question_text)
            previous_id = duplicate_tracker.get(normalized)
            if previous_id:
                errors.append(f"Question {question_id}: intitulé dupliqué avec {previous_id}.")
            else:
                duplicate_tracker[normalized] = question_id or f"row-{index}"

        if len(options) < 4:
            errors.append(f"Question {question_id or index}: moins de 4 options.")

        option_ids = {option.get('id') for option in options}
        if len(correct_answers) < 1:
            errors.append(f"Question {question_id or index}: aucune bonne réponse.")
        elif not set(correct_answers).issubset(option_ids):
            errors.append(f"Question {question_id or index}: bonne réponse absente des options.")

        if not explanation:
            errors.append(f"Question {question_id or index}: explication vide.")
        if not reference:
            errors.append(f"Question {question_id or index}: référence vide.")
        if not source_page:
            errors.append(f"Question {question_id or index}: sourcePage vide.")

    if errors:
        print("Validation échouée:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Validation réussie: {len(questions)} questions valides.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
