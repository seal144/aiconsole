// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { StateCreator } from 'zustand';

import { Asset, AssetType, AssetTypePlural } from '@/types/assets/assetTypes';
import { AssetsAPI } from '../../api/api/AssetsAPI';
import { EditablesStore } from './useEditablesStore';
import { getAssetType } from '@/utils/assets/getAssetType';

export type EditablesSlice = {
  deleteAsset: (assetType: AssetType, id: string) => Promise<void>;
  canOpenFinderForEditable(editable: Asset): boolean;
  openFinderForEditable: (editable: Asset) => void;
};

export const createEditablesSlice: StateCreator<EditablesStore, [], [], EditablesSlice> = (set) => ({
  deleteAsset: async (assetType: AssetType, id: string) => {
    await AssetsAPI.deleteAsset(assetType, id);
    const assetTypePlural = (assetType + 's') as AssetTypePlural;

    set((state) => ({
      [assetTypePlural]: (state[assetTypePlural] || []).filter((asset) => asset.id !== id),
    }));
  },
  canOpenFinderForEditable: (editable: Asset) => {
    const asset = editable as Asset;
    if (asset.defined_in === 'aiconsole') {
      return false;
    }

    if (window?.electron?.openFinder === undefined) {
      return false;
    }

    return true;
  },
  openFinderForEditable: async (editable: Asset) => {
    const type = getAssetType(editable);
    if (type === undefined) {
      return;
    }

    const path = await AssetsAPI.getPathForAsset(type, editable.id);
    window?.electron?.openFinder?.(path || '');
  },
});
