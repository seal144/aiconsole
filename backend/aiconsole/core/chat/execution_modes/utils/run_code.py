import logging
from contextlib import asynccontextmanager

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
from aiconsole.core.settings.settings import settings

_log = logging.getLogger(__name__)


@asynccontextmanager
async def tool_call_execution_state(chat_mutator: ChatMutator, tool_call_id: str, executing: bool):
    try:
        await chat_mutator.mutate(SetIsExecutingToolCallMutation(tool_call_id=tool_call_id, is_executing=True))
        yield
    finally:
        await chat_mutator.mutate(SetIsExecutingToolCallMutation(tool_call_id=tool_call_id, is_executing=False))


async def run_code(
    chat_mutator: ChatMutator,
    materials: list[AICMaterial],
    tool_call_id,
):
    tool_call_location = chat_mutator.chat.get_tool_call_location(tool_call_id)

    if not tool_call_location:
        raise Exception(f"Tool call {tool_call_id} should have been created")

    tool_call = tool_call_location.tool_call

    async with tool_call_execution_state(chat_mutator, tool_call_id, True):
        await chat_mutator.mutate(SetOutputToolCallMutation(tool_call_id=tool_call_id, output=""))
        await chat_mutator.mutate(SetIsSuccessfulToolCallMutation(tool_call_id=tool_call_id, is_successful=False))

        if tool_call.language is None:
            logging.error(f"Tool call {tool_call_id} has no language specified.")
            return

        output_length = 0
        TOOL_CALL_OUTPUT_LIMIT = settings().unified_settings.tool_call_output_limit

        try:
            async for token in run_in_code_interpreter(
                tool_call.language, chat_mutator.chat.id, tool_call.code, materials
            ):
                new_output_length = output_length + len(token)
                if TOOL_CALL_OUTPUT_LIMIT is None or new_output_length <= TOOL_CALL_OUTPUT_LIMIT:
                    await chat_mutator.mutate(
                        AppendToOutputToolCallMutation(tool_call_id=tool_call_id, output_delta=token)
                    )
                    output_length = new_output_length
                else:
                    await chat_mutator.mutate(
                        AppendToOutputToolCallMutation(
                            tool_call_id=tool_call_id, output_delta="\n[Output truncated due to limit]"
                        )
                    )
                    break
            await chat_mutator.mutate(SetIsSuccessfulToolCallMutation(tool_call_id=tool_call_id, is_successful=True))
        except CodeExecutionError as e:
            _log.error(f"Code execution error for tool call {tool_call_id}: {e}")
