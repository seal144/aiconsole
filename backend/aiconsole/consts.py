# The AIConsole Project
#
# Copyright 2023 10Clouds
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import os
from functools import lru_cache
from pathlib import Path

# WARNING: care with 3rd party imports, we have script for electron
# that imports this file without installing 3rd party packages

# this is a path to the root of the project - usually the installed one
# this is pointing to the backend/aiconsole directory
APPLICATION_NAME = "AIConsole"
AICONSOLE_PATH = Path(__file__).parent

ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

DIR_WITH_AICONSOLE_PACKAGE = Path(__file__).parent.parent

GLOBAL_SETTINGS_FILENAME = "settings.toml"
RECENT_FILENAME = "recent"


@lru_cache()
def AICONSOLE_USER_CONFIG_DIR() -> Path:
    from aiconsole.utils.change_folder_icon import change_aiconsole_folder_icon
    from aiconsole.utils.handle_legacy_filepath import handle_legacy_global_filepath

    path = Path.home() / APPLICATION_NAME
    if not path.exists():
        path.mkdir(parents=True)
        # FIX: resolve issues duiring build for pyobjc-core, pyobjc-framework-cocoa
        # change_aiconsole_folder_icon(path)

    handle_legacy_global_filepath(path)

    return path


HISTORY_LIMIT: int = 1000
COMMANDS_HISTORY_JSON: str = "command_history.json"

DIRECTOR_MIN_TOKENS: int = 250
DIRECTOR_PREFERRED_TOKENS: int = 1000

MAX_RECENT_PROJECTS = 8

DIRECTOR_AGENT_ID = "director"

LOG_FORMAT: str = "{name} {funcName} {message}"
LOG_STYLE: str = "{"
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

LOG_HANDLERS: list[str]

if LOG_LEVEL == "DEBUG":
    LOG_HANDLERS = ["developmentHandler"]
else:
    LOG_HANDLERS = ["defaultHandler"]

log_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "rich": {
            "()": "logging.Formatter",
            "fmt": LOG_FORMAT,
            "datefmt": "%H:%M:%S ",
            "style": LOG_STYLE,
        },
        "default": {"()": "logging.Formatter", "fmt": "{asctime} [{levelname}] {name}: {message}", "style": "{"},
    },
    "handlers": {
        "developmentHandler": {
            "formatter": "rich",
            "class": "rich.logging.RichHandler",
            "rich_tracebacks": True,
        },
        "defaultHandler": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
            "level": "INFO",
        },
    },
    "loggers": {
        "aiconsole": {
            "handlers": LOG_HANDLERS,
            "level": LOG_LEVEL,
            "propagate": False,
        },
        "uvicorn": {
            "handlers": LOG_HANDLERS,
            "level": "INFO",
        },
    },
}
