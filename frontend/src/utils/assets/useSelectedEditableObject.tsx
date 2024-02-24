import { useChatStore } from '@/store/assets/chat/useChatStore';
import { useAssetStore } from '@/store/assets/asset/useAssetStore';
import { Asset, EditableObject } from '@/types/assets/assetTypes';
import { AICChat } from '@/types/assets/chatTypes';
import { getEditableObjectType } from './getEditableObjectType';
import { useCallback } from 'react';

export function useSelectedEditableObject(): [EditableObject | undefined, (editable: EditableObject) => void] {
  const chat = useChatStore((state) => state.chat);
  const selectedAsset = useAssetStore((state) => state.selectedAsset);
  const type = getEditableObjectType(selectedAsset);

  const setSelectedEditableObject = useCallback(
    (editable: EditableObject) => {
      if (type === 'chat') {
        useChatStore.setState({ chat: editable as AICChat });
      } else {
        useAssetStore.setState({ selectedAsset: editable as Asset });
      }
    },
    [type],
  );

  return [chat || selectedAsset, setSelectedEditableObject];
}
