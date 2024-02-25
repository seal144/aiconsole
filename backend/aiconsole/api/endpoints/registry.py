from functools import lru_cache

from aiconsole.api.endpoints.services import AssetsService


@lru_cache
def assets() -> AssetsService:
    return AssetsService()
