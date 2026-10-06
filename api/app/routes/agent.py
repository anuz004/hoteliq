from fastapi import APIRouter
from pydantic import BaseModel

from app.services.analytics import agent_investigate, get_agent_tools

router = APIRouter()


class AgentRequest(BaseModel):
    question: str


@router.get('/agent/tools')
def agent_tools() -> dict:
    return get_agent_tools()


@router.post('/agent/investigate')
def investigate(payload: AgentRequest) -> dict:
    return agent_investigate(payload.question)


@router.post('/agent/chat')
def chat(payload: AgentRequest) -> dict:
    return agent_investigate(payload.question)
