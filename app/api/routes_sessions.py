from fastapi import APIRouter, Depends

from app.core.dependencies import get_session_inspector_service
from app.schemas.session import ContextDiffResponse, SessionContextResponse
from app.services.session_inspector_service import SessionInspectorService

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/{session_id}/context", response_model=SessionContextResponse)
def get_session_context(
    session_id: str,
    inspector_service: SessionInspectorService = Depends(get_session_inspector_service),
) -> SessionContextResponse:
    return inspector_service.get_context(session_id)


@router.get("/{session_id}/context-diff/{turn}", response_model=ContextDiffResponse)
def get_session_context_diff(
    session_id: str,
    turn: int,
    inspector_service: SessionInspectorService = Depends(get_session_inspector_service),
) -> ContextDiffResponse:
    return inspector_service.get_context_diff(session_id, turn)
