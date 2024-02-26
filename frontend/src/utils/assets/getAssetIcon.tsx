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

import { Asset, AssetType, Material, MaterialContentType } from '@/types/assets/assetTypes';
import { Blocks, Bot, FileQuestion, MessageSquare, ScanText, StickyNote } from 'lucide-react';
import { getAssetType } from './getAssetType';

export const MATERIAL_CONTENT_TYPE_ICONS = {
  static_text: StickyNote,
  dynamic_text: ScanText,
  api: Blocks,
};

export function getAssetIcon(asset?: Asset | AssetType, contentType?: MaterialContentType) {
  let assetType;

  if (typeof asset === 'string') {
    assetType = asset;
  } else {
    assetType = getAssetType(asset);
    if (assetType === 'material' && !contentType) {
      contentType = (asset as Material).content_type;
    }
  }

  switch (assetType) {
    case 'material': {
      const icon = MATERIAL_CONTENT_TYPE_ICONS[contentType ?? 'static_text'];
      if (!icon) {
        return FileQuestion;
      }
      return icon;
    }
    case 'agent':
      return Bot;
    case 'chat':
      return MessageSquare;
    default:
      return FileQuestion;
  }
}
