# The AIConsole Project
#
# Copyright 2023 10Clouds
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from logging import config
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from aiconsole import projects
from aiconsole.api.routers import app_router
from aiconsole.project_settings import project_settings
from aiconsole.consts import ORIGINS, log_config
from aiconsole.websockets.outgoing_messages import NotificationWSMessage


@asynccontextmanager
async def lifespan(app: FastAPI):
    await project_settings.init()
    if projects.is_project_initialized():
        await projects.reinitialize_project()
    yield


config.dictConfig(log_config)

def app():
    app = FastAPI(title="AI Console", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(app_router)

    return app