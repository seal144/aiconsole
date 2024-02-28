from typing import Type

from .base_code_interpreter import BaseCodeInterpreter
from .language import LanguageStr
from .languages.python import Python

language_map: dict[LanguageStr, Type[BaseCodeInterpreter]] = {
    "python": Python,
}
