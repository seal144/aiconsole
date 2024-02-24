from fastapi import HTTPException
from fastapi.responses import JSONResponse

from aiconsole.api.utils.enabld_flag_change_post_body import EnabledFlagChangePostBody
from aiconsole.core.assets.assets import Assets
from aiconsole.core.assets.types import AssetType


async def asset_status_change(asset_type: AssetType, asset_id: str, body: EnabledFlagChangePostBody):
    try:
        Assets.set_enabled(asset_type, id=asset_id, enabled=body.enabled, to_global=body.to_global)
        return JSONResponse({"status": "ok"})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
