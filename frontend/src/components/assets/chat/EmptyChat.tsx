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

import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/common/Button';
import { ContextMenu, ContextMenuRef } from '@/components/common/ContextMenu';
import { LeaveProjectDialog } from '@/components/common/LeaveProjectDialog';
import { useChatStore } from '@/store/assets/chat/useChatStore';
import { useEditablesStore } from '@/store/assets/useEditablesStore';
import { useProjectStore } from '@/store/projects/useProjectStore';
import { useProjectContextMenu } from '@/utils/projects/useProjectContextMenu';
import { RefreshCcw } from 'lucide-react';
import { cn } from '@/utils/common/cn';
import { Icon } from '@/components/common/icons/Icon';

export const EmptyChat = () => {
  const projectName = useProjectStore((state) => state.projectName);
  const { menuItems, isDialogOpen, closeDialog } = useProjectContextMenu();
  const triggerRef = useRef<ContextMenuRef>(null);
  const submitCommand = useChatStore((state) => state.submitCommand);
  const assets = useEditablesStore((state) =>
    state.materials && state.agents ? [...state.materials, ...state.agents] : [],
  );
  const [lastExamples, setLastExamples] = useState<string[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const numberOfDisplayedExamples = 4;

  const examplePrompts = useMemo(() => {
    // Use lastExamples directly from the state
    const usageExamples = assets
      .map((m) => m.usage_examples)
      .flat()
      .filter((example) => !lastExamples.includes(example));

    const randomExamples = usageExamples.sort(() => Math.random() - 0.5).slice(0, numberOfDisplayedExamples);

    return randomExamples;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCounter]);

  useEffect(() => {
    setLastExamples(examplePrompts);
  }, [examplePrompts]);

  const openContext = (event: MouseEvent) => {
    if (triggerRef.current) {
      triggerRef?.current.handleTriggerClick(event);
    }
  };

  const refreshUsageExamples = () => {
    setRefreshCounter((prevCounter) => prevCounter + 1);
  };

  return (
    <section className="flex flex-col items-center justify-center container mx-auto px-6 py-[64px] pb-[40px] select-none flex-grow h-full w-full">
      <img src="chat-page-glow.png" alt="glow" className="absolute top-[40px] -z-[1]" />
      <p className="text-[16px] text-gray-300 text-center mb-[15px]">Welcome to the project</p>
      <ContextMenu options={menuItems} ref={triggerRef}>
        <h2
          className="text-[36px] text-center font-black cursor-pointer uppercase text-white mb-[40px]"
          onClick={openContext}
        >
          {projectName}
        </h2>
      </ContextMenu>

      <div className="max-w-[700px] w-full flex flex-wrap justify-center items-center">
        {examplePrompts.map((prompt, index) => (
          <div key={index} className="w-1/2 p-2">
            <Button classNames="w-full" variant="secondary" transparent onClick={() => submitCommand(prompt)}>
              {prompt}
            </Button>
          </div>
        ))}
      </div>
      <Icon
        icon={RefreshCcw}
        width={16}
        height={16}
        className={cn(`cursor-pointer text-gray-300 hover:text-white mt-[20px]`)}
        onClick={refreshUsageExamples}
      />
      <LeaveProjectDialog onCancel={closeDialog} isOpen={isDialogOpen} />
    </section>
  );
};
