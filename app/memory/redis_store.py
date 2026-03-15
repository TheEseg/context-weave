from __future__ import annotations

import json

from redis import Redis


class RedisMemoryStore:
    def __init__(self, redis_url: str, client: Redis | None = None):
        self.client = client or Redis.from_url(redis_url, decode_responses=True)

    @staticmethod
    def recent_messages_key(session_id: str) -> str:
        return f"sess:{session_id}:recent_messages"

    @staticmethod
    def summary_key(session_id: str) -> str:
        return f"sess:{session_id}:summary"

    @staticmethod
    def task_state_key(session_id: str) -> str:
        return f"sess:{session_id}:task_state"

    @staticmethod
    def context_snapshots_key(session_id: str) -> str:
        return f"sess:{session_id}:context_snapshots"

    def get_recent_messages(self, session_id: str) -> list[dict[str, str]]:
        raw_items = self.client.lrange(self.recent_messages_key(session_id), 0, -1)
        return [json.loads(item) for item in raw_items]

    def append_recent_message(self, session_id: str, message: dict[str, str], limit: int) -> None:
        key = self.recent_messages_key(session_id)
        self.client.rpush(key, json.dumps(message))
        self.client.ltrim(key, -limit, -1)

    def get_summary(self, session_id: str) -> str:
        return self.client.get(self.summary_key(session_id)) or ""

    def set_summary(self, session_id: str, summary: str) -> None:
        self.client.set(self.summary_key(session_id), summary)

    def get_task_state(self, session_id: str) -> dict[str, str]:
        raw_value = self.client.get(self.task_state_key(session_id))
        return json.loads(raw_value) if raw_value else {}

    def set_task_state(self, session_id: str, task_state: dict[str, str]) -> None:
        self.client.set(self.task_state_key(session_id), json.dumps(task_state))

    def get_context_snapshots(self, session_id: str) -> list[dict[str, object]]:
        raw_items = self.client.lrange(self.context_snapshots_key(session_id), 0, -1)
        return [json.loads(item) for item in raw_items]

    def append_context_snapshot(self, session_id: str, snapshot: dict[str, object]) -> None:
        self.client.rpush(self.context_snapshots_key(session_id), json.dumps(snapshot))

    def get_context_snapshot(self, session_id: str, turn: int) -> dict[str, object] | None:
        for snapshot in self.get_context_snapshots(session_id):
            if int(snapshot.get("turn", 0)) == turn:
                return snapshot
        return None

    def get_latest_turn(self, session_id: str) -> int:
        snapshots = self.get_context_snapshots(session_id)
        if not snapshots:
            return 0
        return max(int(snapshot.get("turn", 0)) for snapshot in snapshots)
