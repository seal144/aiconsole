import { z } from 'zod';
import { ObjectRefSchema } from '@/types/assets/assetTypes';

export const BaseMutationSchema = z.object({
  ref: ObjectRefSchema,
});

export type BaseMutation = z.infer<typeof BaseMutationSchema>;

export const CreateMutationSchema = BaseMutationSchema.extend({
  type: z.literal('CreateMutation'),
  object_type: z.string(),
  object: z.record(z.string(), z.any()),
});

export type CreateMutation = z.infer<typeof CreateMutationSchema>;

export const DeleteMutationSchema = BaseMutationSchema.extend({
  type: z.literal('DeleteMutation'),
});

export type DeleteMutation = z.infer<typeof DeleteMutationSchema>;

export const SetValueMutationSchema = BaseMutationSchema.extend({
  type: z.literal('SetValueMutation'),
  key: z.string(),
  value: z.any().optional().default(null),
});

export type SetValueMutation = z.infer<typeof SetValueMutationSchema>;

export const AppendToStringMutationSchema = BaseMutationSchema.extend({
  type: z.literal('AppendToStringMutation'),
  key: z.string(),
  value: z.string(),
});

export type AppendToStringMutation = z.infer<typeof AppendToStringMutationSchema>;

export const AssetMutationSchema = z.discriminatedUnion('type', [
  CreateMutationSchema,
  DeleteMutationSchema,
  SetValueMutationSchema,
  AppendToStringMutationSchema,
]);

export type AssetMutation = z.infer<typeof AssetMutationSchema>;
