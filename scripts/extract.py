from __future__ import annotations

import argparse
import json
import tempfile
from pathlib import Path

import fitz
from paddleocr import PaddleOCR


def extract_page_lines(page, ocr_engine, scale: float) -> list[str]:
    pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
      temp_path = Path(tmp_file.name)

    try:
        pixmap.save(temp_path)
        result = list(ocr_engine.predict(str(temp_path)))
        if not result:
            return []

        page_result = result[0]
        texts = page_result.get("rec_texts", []) if isinstance(page_result, dict) else []
        return [text.strip() for text in texts if text and text.strip()]
    finally:
        temp_path.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="OCR du PDF cardio scanné page par page.")
    parser.add_argument("--pdf", default="public/livre des profs cardio final.pdf", help="Chemin du PDF source.")
    parser.add_argument("--output", default="scripts/ocr-output.json", help="Chemin du fichier JSON de sortie.")
    parser.add_argument("--start-page", type=int, default=1, help="Première page à traiter, indexée à partir de 1.")
    parser.add_argument("--end-page", type=int, default=10, help="Dernière page à traiter, indexée à partir de 1.")
    parser.add_argument("--scale", type=float, default=2.0, help="Facteur de rasterisation PyMuPDF.")
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    document = fitz.open(pdf_path)
    start_index = max(args.start_page - 1, 0)
    end_index = min(args.end_page, len(document))

    ocr_engine = PaddleOCR(
        lang="fr",
        enable_mkldnn=False,
        cpu_threads=1,
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
    )

    extracted_pages = []
    for page_index in range(start_index, end_index):
        lines = extract_page_lines(document[page_index], ocr_engine, args.scale)
        extracted_pages.append(
            {
                "page": page_index + 1,
                "lineCount": len(lines),
                "lines": lines,
            }
        )
        print(f"Page {page_index + 1}: {len(lines)} lignes OCR")

    output_path.write_text(json.dumps(extracted_pages, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Extraction enregistrée dans {output_path.resolve()}")


if __name__ == "__main__":
    main()
