import shutil
from pathlib import Path

from platformdirs import user_config_dir

from aiconsole.consts import APPLICATION_NAME, GLOBAL_SETTINGS_FILENAME, RECENT_FILENAME


def handle_legacy_global_filepath(new_path: Path):
    def move_file_if_exists(source: Path, filename: str):
        source_file = source / filename
        if source_file.exists():
            shutil.move(source_file, new_path / filename)

    # windows path fix, no author in the path
    windows_path = Path(user_config_dir()) / APPLICATION_NAME
    old_path = Path(user_config_dir(APPLICATION_NAME))

    for _path in [windows_path, old_path]:
        move_file_if_exists(_path, GLOBAL_SETTINGS_FILENAME)
        move_file_if_exists(_path, RECENT_FILENAME)
