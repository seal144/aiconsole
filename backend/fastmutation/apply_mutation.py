from typing import Any, Awaitable, Callable

from aiconsole.core.project.project import get_project_assets
from fastmutation.data_context import DataContext
from fastmutation.mutations import (
    AppendToStringMutation,
    AssetMutation,
    CreateMutation,
    DeleteMutation,
    SetValueMutation,
)


async def _handle_CreateMutation(root: DataContext, mutation: CreateMutation):
    collection = await root.get(mutation.ref.parent_collection)

    if collection is None:
        raise ValueError(f"Collection {mutation.ref.parent_collection} not found")

    asset = get_project_assets().get_asset(mutation.ref.ref_segments[1])  # [0] is 'assets' and [1] is the asset id

    object_type = root.type_to_cls_mapping[mutation.object_type]

    mutation_object = mutation.object.copy()

    # FIXME: This is a hack to remove the id from the object, when its preset
    # objects should have id as our types (AIChat, AICMessage) have ids
    if "id" in mutation_object:
        del mutation_object["id"]

    obj = object_type(**mutation_object, id=mutation.ref.id)

    attr = asset
    for ref in mutation.ref.ref_segments[2:-1]:
        if isinstance(attr, list):
            attr = next((item for item in attr if item.id == ref), None)
        else:
            attr = getattr(attr, ref)

    if isinstance(attr, list):
        attr.append(obj)
    elif isinstance(attr, dict):
        attr.update(obj)
    else:
        attr = obj

    await get_project_assets().save_asset(asset or attr, (asset and asset.id) or "new", create=asset is None)


async def _handle_DeleteMutation(root: DataContext, mutation: DeleteMutation):
    collection = await root.get(mutation.ref.parent_collection)

    if collection is None:
        raise ValueError(f"Collection {mutation.ref.parent_collection} not found")

    object = await root.get(mutation.ref)

    if object is None:
        raise ValueError(f"Object {mutation.ref} not found")

    collection.remove(object)


# TODO: rework
async def _handle_SetValueMutation(data: DataContext, mutation: SetValueMutation) -> None:
    obj = await data.get(mutation.ref)
    asset = get_project_assets().get_asset(mutation.ref.ref_segments[1])
    if asset is None:
        raise ValueError(f"Asset {mutation.ref.ref_segments[1]} not found")

    attr = asset
    for ref in mutation.ref.ref_segments[2:]:
        if isinstance(attr, list):
            attr = next((item for item in attr if item.id == ref), None)
        else:
            attr = getattr(attr, ref)

    if isinstance(attr, list):
        attr.append(obj)
    elif isinstance(attr, dict):
        attr.update(obj)
    else:
        setattr(attr, mutation.key, mutation.value)

    await get_project_assets().save_asset(asset, asset.id, create=False)


# TODO: rework
async def _handle_AppendToStringMutation(data: DataContext, mutation: AppendToStringMutation) -> None:
    obj = await data.get(mutation.ref)
    asset = get_project_assets().get_asset(mutation.ref.ref_segments[1])
    if asset is None:
        raise ValueError(f"Asset {mutation.ref.ref_segments[1]} not found")

    attr = asset
    for ref in mutation.ref.ref_segments[2:]:
        if isinstance(attr, list):
            attr = next((item for item in attr if item.id == ref), None)
        else:
            attr = getattr(attr, ref)

    if isinstance(attr, list):
        attr.append(obj)
    elif isinstance(attr, dict):
        attr.update(obj)
    else:
        setattr(attr, mutation.key, getattr(attr, mutation.key, "") + mutation.value)

    await get_project_assets().save_asset(asset, asset.id, create=False)


MUTATION_HANDLERS: dict[str, Callable[[DataContext, Any], Awaitable[None]]] = {
    CreateMutation.__name__: _handle_CreateMutation,
    DeleteMutation.__name__: _handle_DeleteMutation,
    SetValueMutation.__name__: _handle_SetValueMutation,
    AppendToStringMutation.__name__: _handle_AppendToStringMutation,
}


async def apply_mutation(root: DataContext, mutation: AssetMutation) -> None:
    """
    KEEEP THIS IN SYNC WITH FRONTEND applyMutation!

    Chat to which we received an exclusive write access.
    It provides modification methods which should be used instead of modifying the chat directly.
    """

    await MUTATION_HANDLERS[mutation.__class__.__name__](root, mutation)
