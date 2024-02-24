import { Asset, AssetType } from '@/types/assets/assetTypes';
import { getAssetType } from './getAssetType';

export function isAsset(editableObject?: Asset | AssetType) {
  if (!editableObject) {
    return false;
  }

  const assetType = typeof editableObject === 'string' ? editableObject : getAssetType(editableObject);
  return assetType === 'material' || assetType === 'agent';
}
