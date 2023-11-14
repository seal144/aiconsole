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


import {
  EditableObject,
  EditableObjectType,
  EditableObjectTypePlural
} from '@/types/editables/assetTypes';
import { convertNameToId } from '@/utils/editables/convertNameToId';
import { getEditableObjectType } from '@/utils/editables/getEditableObjectType';
import { EditablesAPI } from '../../api/api/EditablesAPI';
import { EditablesStore } from './useEditablesStore';

export type EdiblesSlice = {
  renameEditableObject: (editableObject: EditableObject, newName: string, isNew: boolean) => Promise<string>;
  deleteEditableObject: (editableObjectType: EditableObjectType, id: string) => Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createEdiblesSlice: StateCreator<EditablesStore, [], [], EdiblesSlice> = (set, _get) => ({
  //returns new id
  renameEditableObject: async (editableObject: EditableObject, newName: string, isNew: boolean) => {
    editableObject.name = newName;

    const originalId = editableObject.id;
    const editableObjectType = getEditableObjectType(editableObject);
    const editableObjectTypePlural = (editableObjectType + 's') as EditableObjectTypePlural;

    if (!editableObjectType) throw new Error(`Unknown editable object type ${editableObjectType}`);

    // Chats have persistent ids, no need to update them
    if (editableObjectType !== 'chat') {
      const newId = convertNameToId(newName);
      editableObject.id = newId;
    }

    set((state) => ({
      [editableObjectTypePlural]: (state[editableObjectTypePlural] || []).map((editableObject) =>
        editableObject.id === originalId ? editableObject : editableObject,
      ),
    }));

    if (!isNew) {
      await EditablesAPI.updateEditableObject(editableObjectType, editableObject, originalId);
    }

    return editableObject.id;
  },
  deleteEditableObject: async (editableObjectType: EditableObjectType, id: string) => {
    await EditablesAPI.deleteEditableObject(editableObjectType, id);
    const editableObjectTypePlural = (editableObjectType + 's') as EditableObjectTypePlural;

    set((state) => ({
      [editableObjectTypePlural]: (state[editableObjectTypePlural] || []).filter(
        (editableObject) => editableObject.id !== id,
      ),
    }));
  },
});
