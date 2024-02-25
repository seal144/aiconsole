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

import { Icon } from '@/components/common/icons/Icon';
import { useChatStore } from '@/store/assets/chat/useChatStore';
import { useAssetStore } from '@/store/assets/useAssetStore';
import { Agent, Asset, Material } from '@/types/assets/assetTypes';
import useGroupByDate from '@/utils/assets/useGroupByDate';
import { cn } from '@/utils/common/cn';
import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AddAssetDropdown } from '../assets/AddAssetDropdown';
import SideBarItem from './SideBarItem';

function assetMatchesSearchText(asset: Asset, searchText: string) {
  if (asset.name.toLowerCase().includes(searchText.toLowerCase())) {
    return true;
  }

  if (asset.id.toLowerCase().includes(searchText.toLowerCase())) {
    return true;
  }

  if (asset.usage?.toLowerCase().includes(searchText.toLowerCase())) {
    return true;
  }

  if (asset.type.toLowerCase().includes(searchText.toLowerCase())) {
    return true;
  }

  if (!asset.enabled && 'disabled'.toLowerCase().includes(searchText.toLowerCase())) {
    return true;
  }

  if (asset.type === 'material') {
    const material = asset as Material;
    if (material.content_type?.toLowerCase().includes(searchText.toLowerCase())) {
      return true;
    }

    if (material.content?.toLowerCase().includes(searchText.toLowerCase())) {
      return true;
    }
  }

  if (asset.type === 'agent') {
    const agent = asset as Agent;
    if (agent.execution_mode?.toLowerCase().includes(searchText.toLowerCase())) {
      return true;
    }

    if (agent.gpt_mode?.toLowerCase().includes(searchText.toLowerCase())) {
      return true;
    }

    if (agent.system?.toLowerCase().includes(searchText.toLowerCase())) {
      return true;
    }
  }

  if (asset.usage_examples?.some((example) => example.toLowerCase().includes(searchText.toLowerCase()))) {
    return true;
  }

  return false;
}

const SideBar = () => {
  const [searchText, setSearchText] = useState('');

  const chat = useChatStore((state) => state.chat);
  const assets = useAssetStore((state) => state.assets);

  const filteredAssets = useMemo(
    () => assets.filter((asset) => assetMatchesSearchText(asset, searchText)),
    [assets, searchText],
  );

  const sections = useGroupByDate(filteredAssets);
  const setIsChatLoading = useChatStore((state) => state.setIsChatLoading);

  useEffect(() => {
    if (chat?.id) {
      setIsChatLoading(false);
    }
  }, [chat?.id, setIsChatLoading]);

  return (
    <div
      className={`min-w-[336px] w-[336px] h-full bg-gray-900 drop-shadow-md flex flex-col border-r border-gray-600`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-[10px] mb-[5px] px-4 py-2">
          <label htmlFor="search">
            <Icon icon={SearchIcon} className={cn('min-w-[24px] min-h-[24px] w-[24px] h-[24px]')} />
          </label>

          <input
            id="search"
            className="font-normal outline-none border h-[24px] border-gray-400 text-[14px] p-[5px] w-full text-white bg-gray-600 focus:border-primary resize-none overflow-hidden rounded-[4px]  focus:outline-none"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            autoFocus
          />
          {searchText.length > 0 && (
            <Icon
              icon={XIcon}
              className={cn('min-w-[24px] min-h-[24px] w-[24px] h-[24px] cursor-pointer hover:text-white')}
              onClick={() => setSearchText('')}
            />
          )}
          <Icon
            icon={SlidersHorizontalIcon}
            className={cn('min-w-[24px] min-h-[24px] w-[24px] h-[24px] cursor-pointer hover:text-white')}
          />

          <AddAssetDropdown />
        </div>
        <div className="flex flex-col justify-between content-between relative overflow-y-auto">
          <div className="overflow-y-auto min-h-[100px] px-5">
            {sections.map(
              (section, index) =>
                section.assets.length > 0 && (
                  <div key={section.title}>
                    <h3
                      className={cn('uppercase px-[9px] py-[5px] text-gray-400 text-[12px] mb-1', {
                        'mt-6': index !== 0,
                      })}
                    >
                      {section.title}
                    </h3>
                    {section.assets.map((asset) => (
                      <SideBarItem key={asset.id} asset={asset} />
                    ))}
                  </div>
                ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
