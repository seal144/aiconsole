from aiconsole.core.assets.materials.material import AICMaterial
from aiconsole.core.chat.chat_mutations import (
    AppendToOutputToolCallMutation,
    SetIsExecutingToolCallMutation,
    SetIsSuccessfulToolCallMutation,
    SetOutputToolCallMutation,
)
from aiconsole.core.chat.chat_mutator import ChatMutator
from aiconsole.core.code_running.code_interpreters.base_code_interpreter import (
    CodeExecutionError,
)
from aiconsole.core.code_running.run_code import run_in_code_interpreter


async def run_code(
    chat_mutator: ChatMutator,
    materials: list[AICMaterial],
    tool_call_id,
):
    tool_call_location = chat_mutator.chat.get_tool_call_location(tool_call_id)

    if not tool_call_location:
        raise Exception(f"Tool call {tool_call_id} should have been created")

    tool_call = tool_call_location.tool_call

    try:
        await chat_mutator.mutate(
            SetIsExecutingToolCallMutation(
                tool_call_id=tool_call_id,
                is_executing=True,
            )
        )

        await chat_mutator.mutate(
            SetOutputToolCallMutation(
                tool_call_id=tool_call_id,
                output="",
            )
        )

        await chat_mutator.mutate(
            SetIsSuccessfulToolCallMutation(
                tool_call_id=tool_call_id,
                is_successful=False,
            ),
        )

        try:
            assert tool_call.language is not None
            async for token in run_in_code_interpreter(
                tool_call.language, chat_mutator.chat.id, tool_call.code, materials
            ):
                await chat_mutator.mutate(
                    AppendToOutputToolCallMutation(
                        tool_call_id=tool_call_id,
                        output_delta=token,
                    )
                )
            await chat_mutator.mutate(
                SetIsSuccessfulToolCallMutation(
                    tool_call_id=tool_call_id,
                    is_successful=True,
                ),
            )
        except CodeExecutionError:
            pass  # The code will not be successful, but we don't want to raise an error
    finally:
        await chat_mutator.mutate(
            SetIsExecutingToolCallMutation(
                tool_call_id=tool_call_id,
                is_executing=False,
            )
        )
