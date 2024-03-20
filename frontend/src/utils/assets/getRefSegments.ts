import { ObjectRef } from '@/types/assets/assetTypes';

export function getRefSegments(ref: ObjectRef): string[] {
  let ref_: ObjectRef | null = ref;
  const segments: string[] = [];
  while (ref_ !== null) {
    segments.push(ref_.id);
    if (ref_.parent_collection) {
      segments.push(ref_.parent_collection.id);
      ref_ = ref_.parent_collection.parent as ObjectRef | null;
    } else {
      ref_ = null;
    }
  }
  return segments.reverse();
}
