from typing import cast

from aiconsole.core.assets.agents.agent import AICAgent
from aiconsole.core.assets.types import AssetType
from aiconsole.core.project import project


def agents_to_choose_from(all: bool = False) -> list[AICAgent]:
    if all:
        assets = project.get_project_assets().all_assets()
    else:
        assets = project.get_project_assets().assets_with_enabled_flag_set_to(True)

    return cast(list[AICAgent], [asset for asset in assets if asset.type == AssetType.AGENT])
