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

import { useEffect, useMemo, useState } from 'react';

import { Icon } from '@/components/common/icons/Icon';
import { useChatStore } from '@/store/assets/chat/useChatStore';
import { useEditablesStore } from '@/store/assets/useEditablesStore';
import { Asset } from '@/types/assets/assetTypes';
import { cn } from '@/utils/common/cn';
import { RefreshCcw } from 'lucide-react';

const NUMBER_OF_DISPLAYED_EXAMPLES = 2;

interface ExamplePromptProps {
  asset: Asset;
  example: string;
  onSelected: (asset: Asset, example: string) => () => void;
  showExamples: boolean;
  isSelected: boolean;
}

const ExamplePrompt: React.FC<ExamplePromptProps> = ({ asset, example, onSelected, showExamples, isSelected }) => {
  return (
    <div
      className={cn(
        !showExamples && 'opacity-0',
        showExamples && isSelected
          ? 'border border-gray-400 bg-gray-600'
          : 'border border-gray-600 bg-gray-800 hover:bg-gray-700 ',
        'w-1/3 m-2 p-6 h-40 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 rounded-lg  shadow-md flex flex-col justify-between',
      )}
      onClick={onSelected(asset, example)}
    >
      <p className="text-white text-md mb-4 overflow-hidden line-clamp-2">{example}</p>
    </div>
  );
};

export const EmptyChat = () => {
  const command = useChatStore((state) => state.commandHistory[useChatStore.getState().commandIndex]);
  const chatOptions = useChatStore((state) => state.chatOptions);

  function isExampleCurrentlyActive(asset: Asset, example: string) {
    if (command !== example) {
      return false;
    }

    console.log('asset', asset);
    console.log('chatOptions', chatOptions);

    if (asset.type === 'agent') {
      if (chatOptions?.agentId !== asset.id) {
        return false;
      }
    }

    if (asset.type === 'material') {
      if ((chatOptions?.materialsIds.length ?? 0) === 0 || chatOptions?.materialsIds[0] !== asset.id) {
        return false;
      }
    }

    if (!(chatOptions?.aiCanAddExtraMaterials ?? true)) {
      return false;
    }

    return true;
  }

  // Chat options
  const editCommand = useChatStore((state) => state.editCommand);
  const setSelectedAgentId = useChatStore((state) => state.setSelectedAgentId);
  const setSelectedMaterialsIds = useChatStore((state) => state.setSelectedMaterialsIds);
  const setAICanAddExtraMaterials = useChatStore((state) => state.setAICanAddExtraMaterials);

  const assets = useEditablesStore((state) =>
    state.materials && state.agents ? [...state.materials, ...state.agents] : [],
  );
  const [lastExamples, setLastExamples] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState(true);
  const [examplesVersion, setExamplesVersion] = useState(0);

  const examplePrompts = useMemo(() => {
    // Adjusting to include the full asset with its usage examples
    const usageExamplesWithAsset = assets
      .flatMap((asset) => asset.usage_examples.map((example) => ({ asset, example })))
      .filter(({ example }) => !lastExamples.includes(example));

    const randomExamplesWithAsset = usageExamplesWithAsset
      .sort(() => Math.random() - 0.5)
      .slice(0, NUMBER_OF_DISPLAYED_EXAMPLES);

    return randomExamplesWithAsset;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examplesVersion]);

  useEffect(() => {
    setLastExamples(examplePrompts.map(({ example }) => example));
  }, [examplePrompts]);

  const refreshUsageExamples = () => {
    setShowExamples(false);
    setTimeout(() => {
      setShowExamples(true);
      setExamplesVersion((prev) => prev + 1);
    }, 300);
  };

  const onSelected = (asset: Asset, example: string) => () => {
    //if is already selected, deselect
    if (isExampleCurrentlyActive(asset, example)) {
      //deselect
      editCommand('');
      setSelectedAgentId('');
      setSelectedMaterialsIds([]);
      setAICanAddExtraMaterials(false);
      return;
    }

    if (asset.type == 'agent') {
      setSelectedAgentId(asset.id);
    } else {
      setSelectedAgentId('');
    }

    if (asset.type == 'material') {
      setSelectedMaterialsIds([asset.id]);
    } else {
      setSelectedMaterialsIds([]);
    }

    editCommand(example);
    setAICanAddExtraMaterials(true);
  };

  return (
    <section className="flex flex-col container mx-auto px-6 py-[64px] pb-[40px] select-none flex-grow h-full w-full">
      <img src="chat-page-glow.png" alt="glow" className="absolute top-[100px] -z-[1] opacity-70" />
      <p className="text-lg text-gray-300 text-center mt-[100px] mb-[15px]">What can I help you with?</p>
      {examplePrompts.length >= 2 && (
        <div className=" w-full flex flex-row gap-4 justify-center items-center">
          <ExamplePrompt
            asset={examplePrompts[0].asset}
            example={examplePrompts[0].example}
            onSelected={onSelected}
            showExamples={showExamples}
            isSelected={isExampleCurrentlyActive(examplePrompts[0].asset, examplePrompts[0].example)}
          />
          or
          <ExamplePrompt
            asset={examplePrompts[1].asset}
            example={examplePrompts[1].example}
            onSelected={onSelected}
            showExamples={showExamples}
            isSelected={isExampleCurrentlyActive(examplePrompts[1].asset, examplePrompts[1].example)}
          />
        </div>
      )}
      <div className="flex items-center justify-center">
        <button
          className="flex items-center justify-center cursor-pointer text-gray-300 hover:text-white mt-[20px] text-md"
          onClick={refreshUsageExamples}
        >
          <span className="mr-2">More</span>
          <Icon icon={RefreshCcw} width={16} height={16} />
        </button>
      </div>
    </section>
  );
};
