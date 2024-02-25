import { useMemo } from 'react';

import { AssetsAPI } from '@/api/api/AssetsAPI';
import { Asset, AssetType } from '@/types/assets/assetTypes';
import { useToastsStore } from '@/store/common/useToastsStore';
import { useAssetStore } from '@/store/assets/useAssetStore';

export const useAssets = (assetType: AssetType) => {
  const asset = useAssetStore((state) => state.selectedAsset);
  const lastSavedAsset = useAssetStore((state) => state.lastSavedSelectedAsset);
  const showToast = useToastsStore((state) => state.showToast);

  const isAssetStatusChanged = useMemo(() => {
    if (!asset || !lastSavedAsset) {
      return false;
    }
    return asset.enabled !== lastSavedAsset.enabled;
  }, [asset, lastSavedAsset]);

  const updateStatusIfNecessary = async () => {
    if (assetType === 'chat') return;
    if (isAssetStatusChanged && asset) {
      await AssetsAPI.setAssetEnabledFlag(asset.id, asset.enabled);

      showToast({
        title: 'Status changed',
        message: `Status changed to ${asset.enabled}`,
        variant: 'success',
      });
    }
  };

  const renameAsset = async (previousAssetId: string, updatedAsset: Asset) => {
    await AssetsAPI.updateAsset(updatedAsset, previousAssetId);
    await updateStatusIfNecessary();
  };

  return {
    updateStatusIfNecessary,
    isAssetStatusChanged,
    renameAsset,
  };
};
