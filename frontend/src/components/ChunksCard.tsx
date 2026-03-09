import type { SessionChunk } from "../types";

type ChunksCardProps = {
  chunks: SessionChunk[];
};

export function ChunksCard({ chunks }: ChunksCardProps) {
  return (
    <section className="inspector-card">
      <div className="card-header">
        <div>
          <p className="section-kicker">Retrieval</p>
          <h3>Relevant chunks</h3>
        </div>
        <span className="card-tag">{chunks.length} matched</span>
      </div>
      {chunks.length === 0 ? (
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
