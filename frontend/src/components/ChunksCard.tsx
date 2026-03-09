import type { SessionChunk } from "../types";
import { InspectorSection } from "./InspectorSection";

type ChunksCardProps = {
  chunks: SessionChunk[];
  memoryEnabled: boolean;
};

export function ChunksCard({ chunks, memoryEnabled }: ChunksCardProps) {
  return (
    <InspectorSection
      title="Relevant chunks"
      subtitle="Retrieval"
      meta={<span className="card-tag">{memoryEnabled ? `${chunks.length} matched` : "Disabled"}</span>}
      testId="chunks-section"
    >
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
    </InspectorSection>
  );
}
