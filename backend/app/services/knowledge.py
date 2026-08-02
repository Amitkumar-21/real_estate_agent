import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

PROPERTY_FILE = BASE_DIR / "knowledge" / "property.json"


def get_project_info():
    with open(PROPERTY_FILE, "r", encoding="utf-8") as f:
        return json.load(f)