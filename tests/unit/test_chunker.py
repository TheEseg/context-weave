from app.retrieval.chunker import chunk_text


def test_chunker_splits_long_text_with_overlap() -> None:
    text = "alpha " * 120
    chunks = chunk_text(text, chunk_size=100, overlap=20)

    assert len(chunks) > 1
    assert len(chunks[0]) <= 100
    overlap_seed = chunks[0][-20:].strip().split()[0]
    assert overlap_seed in chunks[1]
