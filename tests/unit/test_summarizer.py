from app.memory.summarizer import SessionSummarizer


def test_summarizer_compacts_recent_messages() -> None:
    summarizer = SessionSummarizer(char_limit=120)
    summary = summarizer.summarize(
        "",
        [
            {"role": "user", "content": "We chose FastAPI and Redis."},
            {"role": "assistant", "content": "Stored the architecture choice."},
        ],
    )

    assert "user: We chose FastAPI and Redis." in summary
    assert "assistant: Stored the architecture choice." in summary

