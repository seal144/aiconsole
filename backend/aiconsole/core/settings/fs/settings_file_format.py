from pathlib import Path
from typing import cast

import tomlkit
import tomlkit.container
import tomlkit.items

from aiconsole_toolkit.settings.partial_settings_data import PartialSettingsData


def load_settings_file(file_path: Path) -> PartialSettingsData:
    document = _get_document(file_path)

    if "settings" in document:
        settings = document["settings"]

        # if is container
        if isinstance(settings, dict):
            if "openai_api_key" in settings:
                document["openai_api_key"] = settings["openai_api_key"]

            if "code_autorun" in settings:
                document["code_autorun"] = settings["code_autorun"]

            del document["settings"]

            # save
            _write_document(file_path, document)

    # Convert "enabled" to true and "disabled" to false for boolean fields
    for collection_name in ["materials", "agents"]:
        if collection_name in document:
            coll_dict = cast(dict, document[collection_name])
            for key, value in coll_dict.items():
                if isinstance(value, str):
                    if value.lower() == "enabled":
                        coll_dict[key] = "true"
                    elif value.lower() == "disabled":
                        coll_dict[key] = "false"
                    elif value.lower() == "forced":
                        coll_dict[key] = "true"

    d: dict = dict(document)
    return PartialSettingsData(**d)


def save_settings_file(file_path: Path, settings_data: PartialSettingsData):
    document = _get_document(file_path)
    _update_document(document, settings_data)
    _write_document(file_path, document)


def _get_document(file_path: Path) -> tomlkit.TOMLDocument:
    if not file_path.exists():
        return tomlkit.document()

    with file_path.open("r", encoding="utf8", errors="replace") as file:
        return tomlkit.loads(file.read())


def _update_document(document: tomlkit.TOMLDocument, settings_data: PartialSettingsData):
    settings_data_dump = settings_data.model_dump(exclude_none=True)
    for key, value in settings_data_dump.items():
        if value is None:
            continue

        item = document.get(key)

        if isinstance(item, tomlkit.items.Table) and isinstance(value, dict):
            item.update(value)
        elif isinstance(item, tomlkit.items.Array) and isinstance(value, list):
            item.extend(value)
        else:
            document[key] = value


def _write_document(file_path: Path, document: tomlkit.TOMLDocument):
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with file_path.open("w", encoding="utf8", errors="replace") as file:
        file.write(document.as_string())
