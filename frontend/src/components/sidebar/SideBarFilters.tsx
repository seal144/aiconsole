import { Icon } from '@/components/common/icons/Icon';
import { cn } from '@/utils/common/cn';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SlidersHorizontalIcon } from 'lucide-react';
import { useState } from 'react';
import { toggleFilter, filterDefs, isFilterActive } from './filters';
import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

export const SideBarFilters = ({
  searchText,
  setSearchText,
}: {
  searchText: string;
  setSearchText: (text: string) => void;
}) => {
  const [opened, setOpened] = useState(false);

  const toggleFilterAndSave = (filter: string, value: string) => {
    setSearchText(toggleFilter(searchText, filter, value));
  };

  return (
    <DropdownMenu.Root open={opened} onOpenChange={setOpened}>
      <DropdownMenu.Trigger
        className={cn(
          'group flex justify-center align-center gap-[12px]  py-[6px]  text-gray-300 text-[16px] font-semibold leading-[23px] hover:border-gray-300 transition duration-200 hover:text-gray-300',
          {
            'rounded-b-none text-gray-500': opened,
          },
          'outline-none',
        )}
      >
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Icon
                icon={SlidersHorizontalIcon}
                className={cn('block min-h-[24px] min-w-[24px] ml-auto cursor-pointer hover:text-white', {})}
              />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="top" className="bg-gray-700 p-2 rounded text-white text-xs">
                Filter the list of assets
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn('bg-gray-700 border-t-0 border-gray-800 p-0 w-[180px] z-[10000]', {
            'rounded-t-none ': opened,
          })}
        >
          {filterDefs.map((filterDef) => (
            <React.Fragment key={filterDef.key}>
              <DropdownMenu.Label key={filterDef.key} className="px-[16px] py-[10px] text-[12px] text-gray-400">
                {filterDef.title}
              </DropdownMenu.Label>
              {filterDef.filters.map((filter) => (
                <DropdownMenu.Item
                  key={filter.key}
                  onClick={() => toggleFilterAndSave(filterDef.key, filter.key)}
                  className={cn(
                    'group flex p-0 rounded-none hover:bg-gray-600 focus:outline-none w-full cursor-pointer focus:bg-gray-600',
                    isFilterActive(searchText, filterDef.key, filter.key) ? 'text-white' : 'text-gray-300',
                  )}
                >
                  <div className="flex items-center gap-[12px] px-[16px] py-[10px] text-[14px] group-hover:text-white w-full">
                    {filter.icon}
                    <p>{filter.title}</p>
                  </div>
                </DropdownMenu.Item>
              ))}
            </React.Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
