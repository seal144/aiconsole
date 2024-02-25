import { useChatStore } from '@/store/assets/chat/useChatStore';
import { AICChat } from '@/types/assets/chatTypes';
import { getAssetType } from './getAssetType';
import { useCallback } from 'react';
import { Asset } from '@/types/assets/assetTypes';
import { useAssetStore } from '@/store/assets/useAssetStore';

export function useSelectedAsset(): [Asset | undefined, (editable: Asset) => void] {
  const chat = useChatStore((state) => state.chat);
  const selectedAsset = useAssetStore((state) => state.selectedAsset);
  const type = getAssetType(selectedAsset);

  const setSelectedAsset = useCallback(
    (editable: Asset) => {
      if (type === 'chat') {
        useChatStore.setState({ chat: editable as AICChat });
      } else {
        useAssetStore.setState({ selectedAsset: editable as Asset });
      }
    },
    [type],
  );

  return [chat || selectedAsset, setSelectedAsset];
}
