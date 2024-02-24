import { useEditablesStore } from '@/store/assets/useEditablesStore';
import { Asset, AssetType } from '@/types/assets/assetTypes';
import { isAsset } from './isAsset';
import { useAssetStore } from '@/store/assets/asset/useAssetStore';
import { AssetsAPI } from '@/api/api/AssetsAPI';
import { useSelectedAsset } from './useSelectedAsset';

export function useDeleteAssetWithUserInteraction(assetType: AssetType) {
  const deleteAsset = useEditablesStore((state) => state.deleteAsset);
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);
  const setLastSavedSelectedAsset = useAssetStore((state) => state.setLastSavedSelectedAsset);
  const [editable] = useSelectedAsset();

  async function handleDelete(id: string) {
    await deleteAsset(assetType, id);

    if (editable?.id === id) {
      if (isAsset(assetType) && (editable as Asset).override) {
        //Force reload of the current asset
        const newAsset = await AssetsAPI.fetchAsset<Asset>({ assetType, id });
        setSelectedAsset(newAsset);
        setLastSavedSelectedAsset(newAsset);
      } else {
        //const navigate = useNavigate();
        //This causes the asset list to be fully reloaded, and is probably not really needed:
        //navigate(`/${assetType}s`);
      }
    }
  }

  return handleDelete;
}
