from app.memory.fact_extractor import FactExtractor


def test_fact_extractor_captures_stack_and_named_values() -> None:
    extractor = FactExtractor()
    facts = extractor.extract("The project uses Redis and PostgreSQL. The report name is rai_occulto.")

    pairs = {(fact.fact_key, fact.fact_value) for fact in facts}
    assert ("technology", "Redis") in pairs
    assert ("technology", "PostgreSQL") in pairs
    assert ("report_name", "rai_occulto") in pairs

