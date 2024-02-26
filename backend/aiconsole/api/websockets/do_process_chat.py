import logging
import random
from typing import cast
from uuid import uuid4

from aiconsole.api.websockets.connection_manager import connection_manager
from aiconsole.api.websockets.render_materials import render_materials
from aiconsole.api.websockets.server_messages import (
    ErrorServerMessage,
    NotificationServerMessage,
)
from aiconsole.consts import DIRECTOR_AGENT_ID
from aiconsole.core.assets.agents.agent import AICAgent
from aiconsole.core.assets.types import AssetType
from aiconsole.core.chat.actor_id import ActorId
from aiconsole.core.chat.chat_mutations import CreateMessageGroupMutation
from aiconsole.core.chat.chat_mutator import ChatMutator
from aiconsole.core.chat.execution_modes.analysis.agents_to_choose_from import (
    agents_to_choose_from,
)
from aiconsole.core.chat.execution_modes.utils.import_and_validate_execution_mode import (
    import_and_validate_execution_mode,
)
from aiconsole.core.gpt.types import GPTRole
from aiconsole.core.project import project

_log = logging.getLogger(__name__)


async def do_process_chat(chat_mutator: ChatMutator):
    role: GPTRole = "assistant"

    agent: AICAgent | None = None

    if chat_mutator.chat.chat_options.agent_id and not chat_mutator.chat.chat_options.ai_can_add_extra_materials:
        for _agent in agents_to_choose_from():
            if _agent.id == chat_mutator.chat.chat_options.agent_id:
                agent = _agent
    else:

        director_agent = cast(AICAgent | None, project.get_project_assets().get_asset(DIRECTOR_AGENT_ID))

        if director_agent and director_agent.enabled and director_agent.type == AssetType.AGENT:
            role = "system"  # TODO: This should be read from the agent, not hardcoded
            agent = director_agent
        else:
            await connection_manager().send_to_all(
                NotificationServerMessage(
                    title="No director agent found",
                    message="No director agent found, using a random agent for the chat.",
                )
            )

            possible_agents = agents_to_choose_from()

            # assign a random agent to the chat
            if possible_agents:
                agent = random.choice(possible_agents)

    if not agent:
        await connection_manager().send_to_all(
            ErrorServerMessage(
                error="No agents found, please create an agent before processing the chat.",
            )
        )
        return

    if chat_mutator.chat.chat_options.materials_ids:
        materials_ids = chat_mutator.chat.chat_options.materials_ids
    else:
        materials_ids = []

    if materials_ids:
        try:
            materials_and_rmats = await render_materials(materials_ids, chat_mutator.chat, agent, init=True)
        except ValueError:
            _log.debug(f"Failed to render materials {materials_ids} for chat {chat_mutator.chat.id}")
            return

        materials = materials_and_rmats.materials
        rendered_materials = materials_and_rmats.rendered_materials
    else:
        materials = []
        rendered_materials = []

    # Create a new message group for analysis
    message_group_id = str(uuid4())

    visible_agent_id = agent.id

    if chat_mutator.chat.chat_options.agent_id:
        visible_agent_id = chat_mutator.chat.chat_options.agent_id

    await chat_mutator.mutate(
        CreateMessageGroupMutation(
            message_group_id=message_group_id,
            actor_id=ActorId(type="agent", id=visible_agent_id),
            role=role,
            materials_ids=materials_ids,
            analysis="",
            task="",
        )
    )

    execution_mode = await import_and_validate_execution_mode(agent, chat_mutator.chat.id)

    await execution_mode.process_chat(
        chat_mutator=chat_mutator,
        agent=agent,
        materials=materials,  # type: ignore
        rendered_materials=rendered_materials,
    )
