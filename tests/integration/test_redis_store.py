from app.memory.redis_store import RedisMemoryStore


def test_redis_store_reads_and_writes(memory_store: RedisMemoryStore) -> None:
    memory_store.append_recent_message("sess-redis", {"role": "user", "content": "hello"}, limit=5)
    memory_store.set_summary("sess-redis", "short summary")
    memory_store.set_task_state("sess-redis", {"last_user_message": "hello"})

    assert memory_store.get_recent_messages("sess-redis")[0]["content"] == "hello"
    assert memory_store.get_summary("sess-redis") == "short summary"
    assert memory_store.get_task_state("sess-redis")["last_user_message"] == "hello"

