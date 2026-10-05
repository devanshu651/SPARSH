from pydantic import BaseModel, Field


class AssistantRequest(BaseModel):
    screening_id: str
    action: str = Field(pattern="^(explain_result|explain_missed|next_steps|parent_summary|history_summary)$")
    language: str = Field(default="en", pattern="^(en|hi)$")


class AssistantResponse(BaseModel):
    text: str
    provider: str = "local_grounded"


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant|model|system)$")
    content: str


class ChatAssistantRequest(BaseModel):
    message: str = Field(min_length=1)
    history: list[ChatMessage] = Field(default_factory=list)
    language: str = Field(default="en", pattern="^(en|hi|mr)$")
    current_screen: str | None = None
    context: dict | None = None


class ChatAssistantResponse(BaseModel):
    reply: str
    suggestions: list[str] = Field(default_factory=list)
    follow_up_prompt: str | None = None
    provider: str = "gemini-2.5-flash-lite"
    language: str = "en"
    selected_language: str = "en"
    intent: str = "general"
