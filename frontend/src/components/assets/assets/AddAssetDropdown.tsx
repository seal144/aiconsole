import { Icon } from '@/components/common/icons/Icon';
import { MATERIAL_CONTENT_TYPE_ICONS, getAssetIcon } from '@/utils/assets/getAssetIcon';
import { cn } from '@/utils/common/cn';
import { Content, DropdownMenu, Item, Trigger } from '@radix-ui/react-dropdown-menu';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatIcon = getAssetIcon('chat');
const MaterialNoteIcon = MATERIAL_CONTENT_TYPE_ICONS['static_text'];
const MaterialDynamicNoteIcon = MATERIAL_CONTENT_TYPE_ICONS['dynamic_text'];
const MaterialPythonAPIIcon = MATERIAL_CONTENT_TYPE_ICONS['api'];
const AgentIcon = getAssetIcon('agent');

export const AddAssetDropdown = () => {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();

  const handleClick = (path?: string) => () => {
    if (path) {
      navigate(path);
    }
  };

  const dropdownItems = [
    {
      key: 'chat',
      icon: <Icon icon={ChatIcon} className="w-6 h-6 !text-chat" />,
      title: 'Chat',
      path: `/assets/new?type=chat`,
    },
    {
      key: 'agent',
      icon: <Icon icon={AgentIcon} className="w-6 h-6 !text-agent" />,
      title: 'Agent',
      path: `/assets/new?type=agent`,
    },
    {
      key: 'note',
      icon: <Icon icon={MaterialNoteIcon} className="w-6 h-6 !text-material" />,
      title: 'Note',
      path: `/assets/new?type=material&content_type=static_text`,
    },
    {
      key: 'dynamic_note',
      icon: <Icon icon={MaterialDynamicNoteIcon} className="w-6 h-6 !text-material" />,
      title: 'Dynamic Note',
      path: `/assets/new?type=material&content_type=dynamic_text`,
    },
    {
      key: 'python_api',
      icon: <Icon icon={MaterialPythonAPIIcon} className="w-6 h-6 !text-material" />,
      title: 'Connection',
      path: `/assets/new?type=material&content_type=api`,
    },
  ];

  return (
    <DropdownMenu modal={false} open={opened} onOpenChange={setOpened}>
      <Trigger asChild>
        <button
          className={cn(
            'group flex justify-center align-center gap-[12px]  py-[6px]  text-gray-300 text-[16px] font-semibold leading-[23px] hover:border-gray-300 transition duration-200 hover:text-gray-300',
            {
              'rounded-b-none text-gray-500': opened,
            },
          )}
        >
          <Icon
            icon={PlusIcon}
            className={cn('block min-h-[24px] min-w-[24px] ml-auto cursor-pointer hover:text-white', {})}
          />
        </button>
      </Trigger>

      <Content
        className={cn('bg-gray-700 border-t-0 border-gray-800 p-0 w-[180px] z-[10000]', {
          'rounded-t-none ': opened,
        })}
      >
        {dropdownItems.map(
          ({
            icon,
            title,
            path,
            key,
            disabled,
          }: {
            icon: JSX.Element;
            title: string;
            path: string;
            key: string;
            disabled?: boolean;
          }) => (
            <Item
              key={key}
              onClick={handleClick(path)}
              className={cn('group flex p-0 rounded-none hover:bg-gray-600 hover:outline-none w-full cursor-pointer', {
                'pointer-events-none': disabled,
              })}
            >
              <div
                className={cn(
                  'flex items-center gap-[12px] px-[16px] py-[10px] text-[14px] text-gray-300 group-hover:text-white w-full',
                  {
                    'text-gray-400 pb-0 ': disabled,
                  },
                )}
              >
                {icon}
                <p>{title}</p>
              </div>
            </Item>
          ),
        )}
      </Content>
    </DropdownMenu>
  );
};
