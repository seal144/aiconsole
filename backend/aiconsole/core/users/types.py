from pydantic import BaseModel


class PartialUserProfile(BaseModel):
    user_id: str | None = None
    display_name: str | None = None
    profile_picture: str | None = None


class UserProfile(BaseModel):
    user_id: str | None = None
    display_name: str = "User"
    profile_picture: str | None = None
