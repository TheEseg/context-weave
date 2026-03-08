# Data Model

## PostgreSQL Entities

### Session

- `id`: application-level session identifier
- `user_id`: user scope for the session
- `created_at`, `updated_at`: lifecycle timestamps

### Message

- `id`: primary key
- `session_id`: foreign key to session
- `role`: `user` or `assistant`
- `content`: message body
- `created_at`: event timestamp

### Fact

- `id`: primary key
- `session_id`, `user_id`: fact scope
- `fact_key`, `fact_value`: normalized memory record
- `confidence`: heuristic confidence
- `source_type`: extraction path
- `is_active`: enables future fact invalidation patterns
- `created_at`: capture timestamp

### Document

- `id`: primary key
- `title`: human-readable title
- `source`: original file path or source reference
- `created_at`: ingestion timestamp

### Chunk

- `id`: primary key
- `document_id`: parent document
- `chunk_index`: stable position inside the source document
- `content`: chunk text
- `embedding`: placeholder vector payload, stored in a pgvector-ready shape for later replacement
- `created_at`: ingestion timestamp

## Redis Working Memory

- `sess:{session_id}:recent_messages`
  Stores a rolling JSON list of recent user and assistant messages.

- `sess:{session_id}:summary`
  Stores the compact session summary used for prompt compression.

- `sess:{session_id}:task_state`
  Stores small state needed between adjacent turns, such as the last user instruction.

This split keeps Redis focused on volatile, high-frequency access while PostgreSQL remains the source of record.

