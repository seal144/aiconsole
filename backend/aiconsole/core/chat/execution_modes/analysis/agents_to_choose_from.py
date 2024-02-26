from typing import cast

from aiconsole.consts import DIRECTOR_AGENT_ID
from aiconsole.core.assets.agents.agent import AICAgent
from aiconsole.core.assets.types import AssetType
from aiconsole.core.project import project


def agents_to_choose_from() -> list[AICAgent]:
    assets = project.get_project_assets().assets_with_enabled_flag_set_to(True)

    # Filter to agents except for director
    assets = [asset for asset in assets if asset.type == AssetType.AGENT and asset.id != DIRECTOR_AGENT_ID]

    return cast(list[AICAgent], assets)
