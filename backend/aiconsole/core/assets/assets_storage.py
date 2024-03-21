from typing import Protocol

from .types import Asset, AssetType


class AssetsStorage(Protocol):
    @property
    def assets(self, asset_type: AssetType | None = None) -> list[Asset]:  # fmt: off
        ...

    @property
    def locations(self):  # fmt: off
        ...

    def get_asset(self, asset_id: str) -> Asset | None:  # fmt: off
        ...

    def update_asset(
        self,
        asset_id: str,
    ) -> Asset | None:
        pass

    def create_asset(self, asset: Asset) -> None:
        pass

    def delete_asset(self, asset_id: str) -> None:
        pass

    def propagate_asset_changes(self) -> None:
        pass

    def destroy(self):  # fmt: off
        ...
