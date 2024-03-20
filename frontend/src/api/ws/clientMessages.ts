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

import { z } from 'zod';
import { ChatMutationSchema } from './chat/chatMutations';
import { CollectionRefSchema, ObjectRefSchema } from '@/types/assets/assetTypes';

export const BaseClientMessageSchema = z.object({});

export type BaseClientMessage = z.infer<typeof BaseClientMessageSchema>;

export const DoMutationClientMessageSchema = BaseClientMessageSchema.extend({
  type: z.literal('DoMutationClientMessage'),
  request_id: z.string(),
  mutation: ChatMutationSchema, // Replace with your actual ChatMutationSchema
});

export type DoMutationClientMessage = z.infer<typeof DoMutationClientMessageSchema>;

export const AcquireLockClientMessageSchema = BaseClientMessageSchema.extend({
  type: z.literal('AcquireLockClientMessage'),
  ref: ObjectRefSchema,
  request_id: z.string(),
});

export type AcquireLockClientMessage = z.infer<typeof AcquireLockClientMessageSchema>;

export const ReleaseLockClientMessageSchema = BaseClientMessageSchema.extend({
  type: z.literal('ReleaseLockClientMessage'),
  ref: ObjectRefSchema,
  request_id: z.string(),
});

export type ReleaseLockClientMessage = z.infer<typeof ReleaseLockClientMessageSchema>;

export const SubscribeToClientMessageSchema = BaseClientMessageSchema.extend({
  type: z.literal('SubscribeToClientMessage'),
  ref: ObjectRefSchema,
  request_id: z.string(),
});

export type SubscribeToClientMessage = z.infer<typeof SubscribeToClientMessageSchema>;

export const DuplicateAssetClientMessageSchema = BaseClientMessageSchema.extend({
  type: z.literal('DuplicateAssetClientMessage'),
  asset_id: z.string(),
  request_id: z.string(),
});

export type DuplicateAssetClientMessage = z.infer<typeof DuplicateAssetClientMessageSchema>;

export const StopChatClientMessageSchema = BaseClientMessageSchema.extend({
  type: z.literal('StopChatClientMessage'),
  request_id: z.string(),
  ref: z.object({
    id: z.string(),
    context: z.null(),
    parent_collection: CollectionRefSchema,
    parent: CollectionRefSchema,
  }),
});

export type StopChatClientMessage = z.infer<typeof StopChatClientMessageSchema>;

export const UnsubscribeClientMessageSchema = BaseClientMessageSchema.extend({
  type: z.literal('UnsubscribeClientMessage'),
  ref: ObjectRefSchema,
  request_id: z.string(),
});

export type UnsubscribeClientMessage = z.infer<typeof UnsubscribeClientMessageSchema>;

export const AcceptCodeClientMessageSchema = BaseClientMessageSchema.extend({
  type: z.literal('AcceptCodeClientMessage'),
  request_id: z.string(),
  chat_id: z.string(),
  tool_call_id: z.string(),
});
export type AcceptCodeClientMessage = z.infer<typeof AcceptCodeClientMessageSchema>;

export const ProcessChatClientMessageSchema = BaseClientMessageSchema.extend({
  type: z.literal('ProcessChatClientMessage'),
  request_id: z.string(),
  chat_ref: ObjectRefSchema,
});

export type ProcessChatClientMessage = z.infer<typeof ProcessChatClientMessageSchema>;

export const ClientMessageSchema = z.union([
  DoMutationClientMessageSchema,
  AcquireLockClientMessageSchema,
  ReleaseLockClientMessageSchema,
  DuplicateAssetClientMessageSchema,
  SubscribeToClientMessageSchema,
  StopChatClientMessageSchema,
  UnsubscribeClientMessageSchema,
  AcceptCodeClientMessageSchema,
  ProcessChatClientMessageSchema,
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;
