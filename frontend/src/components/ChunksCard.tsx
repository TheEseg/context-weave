import type { SessionChunk } from "../types";

type ChunksCardProps = {
  chunks: SessionChunk[];
  memoryEnabled: boolean;
};

export function ChunksCard({ chunks, memoryEnabled }: ChunksCardProps) {
  return (
    <section className="inspector-card-panel" data-testid="chunks-section">
      <div className="inspector-card-header">
        <div>
          <p className="section-kicker">Retrieval</p>
          <h3>Relevant chunks</h3>
        </div>
        <span className="card-tag">{memoryEnabled ? `${chunks.length} matched` : "Disabled"}</span>
      </div>
      {!memoryEnabled ? (
        <p className="card-body">Disabled for this turn. Retrieval was bypassed and no document chunks were packed.</p>
      ) : chunks.length === 0 ? (
        <p className="card-body">No supporting document chunks were retrieved for the current session context.</p>
      ) : (
        <div className="chunk-list">
          {chunks.map((chunk) => (
            <article key={`${chunk.document_title}-${chunk.chunk_index}`} className="chunk-item">
              <div className="chunk-meta">
                <strong>{chunk.document_title}</strong>
                <span>Chunk {chunk.chunk_index}</span>
              </div>
              <p>{chunk.content}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
