import { Icon } from '@/components/common/icons/Icon';
import { Agent, Asset, Material } from '@/types/assets/assetTypes';
import { CheckSquareIcon, FolderCogIcon, FolderIcon, SlidersHorizontalIcon, SquareIcon } from 'lucide-react';
import { MATERIAL_CONTENT_TYPE_ICONS, getAssetIcon } from '@/utils/assets/getAssetIcon';

export const filterDefs = [
  {
    key: 'type',
    icon: <Icon icon={SlidersHorizontalIcon} className="w-6 h-6" />,
    title: 'Type',
    filters: [
      { key: 'chat', icon: <Icon icon={getAssetIcon('chat')} className="w-6 h-6 !text-chat" />, title: 'Chat' },
      {
        key: 'material',
        icon: <Icon icon={MATERIAL_CONTENT_TYPE_ICONS['static_text']} className="w-6 h-6 !text-material" />,
        title: 'Material',
      },
      { key: 'agent', icon: <Icon icon={getAssetIcon('agent')} className="w-6 h-6 !text-agent" />, title: 'Agent' },
    ],
  },
  {
    key: 'status',
    icon: <Icon icon={CheckSquareIcon} className="w-6 h-6" />,
    title: 'Status',
    filters: [
      { key: 'enabled', icon: <Icon icon={CheckSquareIcon} className="w-6 h-6" />, title: 'Enabled' },
      { key: 'disabled', icon: <Icon icon={SquareIcon} className="w-6 h-6" />, title: 'Disabled' },
    ],
  },
  {
    key: 'location',
    icon: <Icon icon={FolderCogIcon} className="w-6 h-6" />,
    title: 'Location',
    filters: [
      { key: 'aiconsole', icon: <Icon icon={FolderCogIcon} className="w-6 h-6" />, title: 'System' },
      { key: 'project', icon: <Icon icon={FolderIcon} className="w-6 h-6" />, title: 'Project' },
    ],
  },
];

export function assetMatchesSearchText(asset: Asset, searchText: string) {
  //split the search text into filters and search text
  const components = searchText.split(' ');
  const filters: { key: string; value: string }[] = components
    .filter((component) => component.includes(':'))
    .map((component) => {
      const [key, value] = component.split(':');
      return { key, value };
    });

  for (const filter of filters) {
    if (filter.key === 'type') {
      if (filter.value === 'chat' && asset.type !== 'chat') {
        return false;
      }
      if (filter.value === 'material' && asset.type !== 'material') {
        return false;
      }
      if (filter.value === 'agent' && asset.type !== 'agent') {
        return false;
      }
    }
    if (filter.key === 'status') {
      if (filter.value === 'enabled' && !asset.enabled) {
        return false;
      }
      if (filter.value === 'disabled' && asset.enabled) {
        return false;
      }
    }
    if (filter.key === 'location') {
      if (filter.value === 'aiconsole' && asset.defined_in !== 'aiconsole') {
        return false;
      }
      if (filter.value === 'project' && asset.defined_in !== 'project') {
        return false;
      }
    }
  }

  const search = components
    .filter((component) => !component.includes(':'))
    .map((component) => component.trim())
    .filter((component) => component.length > 0)
    .join(' ')
    .toLowerCase();

  if (asset.name.toLowerCase().includes(search)) {
    return true;
  }

  if (asset.id.toLowerCase().includes(search)) {
    return true;
  }

  if (asset.usage?.toLowerCase().includes(search)) {
    return true;
  }

  if (asset.type.toLowerCase().includes(search)) {
    return true;
  }

  if (!asset.enabled && 'disabled'.toLowerCase().includes(search)) {
    return true;
  }

  if (asset.type === 'material') {
    const material = asset as Material;
    if (material.content_type?.toLowerCase().includes(search)) {
      return true;
    }

    if (material.content?.toLowerCase().includes(search)) {
      return true;
    }
  }

  if (asset.type === 'agent') {
    const agent = asset as Agent;
    if (agent.execution_mode?.toLowerCase().includes(search)) {
      return true;
    }

    if (agent.gpt_mode?.toLowerCase().includes(search)) {
      return true;
    }

    if (agent.system?.toLowerCase().includes(search)) {
      return true;
    }
  }

  if (asset.usage_examples?.some((example) => example.toLowerCase().includes(search))) {
    return true;
  }

  return false;
}
export function toggleFilter(searchText: string, filter: string, value: string) {
  //search text is of following format "some text filter: value filter2: value2"
  const filters = searchText.split(' ');
  const existingFilterIndex = filters.findIndex((f) => f === `${filter}:${value}`);
  let newFilters;

  if (existingFilterIndex !== -1) {
    // If the same filter:value pair is found, remove it
    newFilters = filters.filter((_, index) => index !== existingFilterIndex);
  } else {
    // Remove any existing filter of the same type and add the new filter:value pair
    newFilters = filters.filter((f) => !f.startsWith(filter));
    newFilters.push(`${filter}:${value}`);
  }

  return newFilters.join(' ');
}

export function isFilterActive(searchText: string, filter: string, value: string) {
  return searchText.includes(`${filter}:${value}`);
}
