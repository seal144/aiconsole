from typing import cast

from aiconsole.core.assets.agents.agent import AICAgent
from aiconsole.core.assets.types import AssetType
from aiconsole.core.project import project


def agents_to_choose_from(all: bool = False) -> list[AICAgent]:
    assets_to_choose_from = project.get_project_assets(AssetType.AGENT).assets_with_enabled_flag_set_to(True)
    if all:
        assets_to_choose_from = project.get_project_assets(AssetType.AGENT).all_assets()
    agents_to_choose_from = cast(list[AICAgent], assets_to_choose_from)
    return agents_to_choose_from
