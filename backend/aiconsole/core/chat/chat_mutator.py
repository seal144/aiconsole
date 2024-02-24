from typing import Protocol

from aiconsole.core.chat.chat_mutations import ChatMutation
from aiconsole.core.chat.types import AICChat


class ChatMutator(Protocol):
    # readonly chat: Chat
    @property
    def chat(self) -> AICChat:  # fmt: off
        ...

    async def mutate(self, mutation: ChatMutation) -> None:  # fmt: off
        ...
