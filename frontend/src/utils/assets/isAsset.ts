import { Asset, AssetType } from '@/types/assets/assetTypes';
import { getAssetType } from './getAssetType';

export function isAsset(asset?: Asset | AssetType) {
  if (!asset) {
    return false;
  }

  const assetType = typeof asset === 'string' ? asset : getAssetType(asset);
  return assetType === 'material' || assetType === 'agent';
}
