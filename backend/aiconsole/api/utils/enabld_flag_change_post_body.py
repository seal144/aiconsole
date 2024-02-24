from pydantic import BaseModel


class EnabledFlagChangePostBody(BaseModel):
    enabled: bool
    to_global: bool
