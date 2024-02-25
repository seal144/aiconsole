from fastapi import UploadFile

from aiconsole.core.assets.assets import Assets
from aiconsole.core.assets.types import Asset, AssetType
from aiconsole.core.project import project
from aiconsole.core.project.paths import get_project_assets_directory


class AssetWithGivenNameAlreadyExistError(Exception):
    pass


class AssetsService:
    async def _create(self, assets: Assets, asset_id: str, asset: Asset) -> None:
        self._validate_existance(assets, asset_id)

        await assets.save_asset(asset, old_asset_id=asset_id, create=True)

    async def _partially_update(self, assets: Assets, old_asset_id: str, asset: Asset) -> None:
        # if asset.id != old_asset_id:
        #     self._validate_existance(assets, asset.id)

        await assets.save_asset(asset, old_asset_id=old_asset_id, create=True)

    def _validate_existance(self, assets: Assets, asset_id: str) -> None:
        existing_asset = assets.get_asset(asset_id)
        if existing_asset is not None:
            raise AssetWithGivenNameAlreadyExistError()

    async def cretate_asset(self, asset_id: str, asset: Asset) -> None:
        assets = project.get_project_assets()
        await self._create(assets, asset_id, asset)

    async def partially_update_asset(self, asset_id: str, asset: Asset) -> None:
        assets = project.get_project_assets()
        await self._partially_update(assets, asset_id, asset)

    async def set_avatar(self, asset_id: str, avatar: UploadFile) -> None:
        asset = project.get_project_assets().get_asset(asset_id)

        if asset is None or asset.type != AssetType.AGENT:
            raise ValueError(f"Asset {asset_id} not found or is not an agent")

        image_path = get_project_assets_directory(asset.type) / f"{asset_id}.jpg"
        content = await avatar.read()
        with open(image_path, "wb+") as avatar_file:
            avatar_file.write(content)
