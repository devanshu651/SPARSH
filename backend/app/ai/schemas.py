from pydantic import BaseModel, Field


class AssistantRequest(BaseModel):
    screening_id: str
    action: str = Field(pattern="^(explain_result|explain_missed|next_steps|parent_summary|history_summary)$")
    language: str = Field(default="en", pattern="^(en|hi)$")


class AssistantResponse(BaseModel):
    text: str
    provider: str = "local_grounded"
