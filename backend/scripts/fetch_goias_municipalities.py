#!/usr/bin/env python3
"""
Fetch IBGE municipalities for Goiás (UF=52) and write a simplified JSON file.
Generates: backend/exports/goias_municipalities.json
"""
import json
from urllib.request import urlopen
import gzip
from io import BytesIO
from pathlib import Path

# compute output path relative to repository backend/exports
SCRIPT_DIR = Path(__file__).resolve().parent
OUT_DIR = SCRIPT_DIR.parent / "exports"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / "goias_municipalities.json"
URL = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/52/municipios"

def main():
    with urlopen(URL) as resp:
        raw = resp.read()
    # handle gzipped responses
    if len(raw) >= 2 and raw[0] == 0x1F and raw[1] == 0x8B:
        try:
            raw = gzip.decompress(raw)
        except Exception:
            # fallback to gzip via BytesIO
            raw = gzip.GzipFile(fileobj=BytesIO(raw)).read()
    data = json.loads(raw.decode("utf-8"))
    simplified = [{"id": item["id"], "name": item["nome"]} for item in data]
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(simplified, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(simplified)} municipalities to {OUT}")

if __name__ == "__main__":
    main()
