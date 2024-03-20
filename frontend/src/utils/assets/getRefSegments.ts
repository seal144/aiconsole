import { ObjectRef } from '@/types/assets/assetTypes';

export function getRefSegments(ref: ObjectRef): string[] {
  let ref_: ObjectRef | null = ref;
  const segments: string[] = [];
  while (ref_) {
    segments.push(ref_.id);
    segments.push(ref_.parent_collection.id);
    ref_ = ref_.parent_collection.parent;
  }
  return segments.reverse();
}
