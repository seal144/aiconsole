from pathlib import Path
from typing import cast

import tomlkit
import tomlkit.container
import tomlkit.items

from aiconsole_toolkit.settings.partial_settings_data import PartialSettingsData


def load_settings_file(file_path: Path) -> PartialSettingsData:
    document = _get_document(file_path)
    update_file = False

    update_file |= _extract_and_delete_settings(document)
    update_file |= _convert_enabled_disabled_to_boolean(document)

    data = PartialSettingsData(**document.value)

    if update_file:
        _write_document(file_path, document)

    return data


def _extract_and_delete_settings(document):
    update_file = False
    if "settings" in document:
        settings = document["settings"]
        if isinstance(settings, dict):
            for key in ["openai_api_key", "code_autorun"]:
                if key in settings:
                    document[key] = settings[key]
            del document["settings"]
            update_file = True
    return update_file


def _convert_enabled_disabled_to_boolean(document):
    update_file = False
    for collection_name in ["materials", "agents"]:
        if collection_name in document:
            collection_dict = cast(dict, document[collection_name])
            for key, value in list(collection_dict.items()):
                if isinstance(value, str) and value.lower() in ["enabled", "forced", "disabled"]:
                    collection_dict[key] = value.lower() in ["enabled", "forced"]
                    update_file = True
            if update_file:
                document.setdefault("assets", {}).update(collection_dict)
                del document[collection_name]
    return update_file


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
    settings_data_dump = settings_data.model_dump(exclude_none=True, mode="json")
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
