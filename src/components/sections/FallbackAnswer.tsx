import { useMemo } from "react";
import FallbackBlock from "@/components/FallbackBlock";
import { resolveBlock, isFallbackAnswerBlock } from "@/lib/blockRegistry";
import type { BlockId, RecordId } from "@/lib/viewContract";

/**
 * FallbackAnswer — renders pre-authored answer blocks for the long tail.
 *
 * The router selects WHICH authored block answers an unmatchable question; it
 * never writes one. Only IDs in blockRegistry's FALLBACK_ANSWER_BLOCKS
 * allowlist render here — an arbitrary block: ID cannot be surfaced through
 * this path even if the router asks for it.
 *
 * Empty record_ids renders the authored empty-state block, which says plainly
 * that nothing here answers the question. That admission IS the boundary story
 * demonstrating itself; it is never bridged with generated text.
 */

const EMPTY_STATE: BlockId = "block:fallback-empty-state";

interface FallbackAnswerProps {
  record_ids?: RecordId[];
}

export default function FallbackAnswer({ record_ids = [] }: FallbackAnswerProps) {
  const blockIds = useMemo(() => {
    const requested = record_ids.filter((id): id is BlockId => {
      if (!id.startsWith("block:")) {
        console.warn(`[FallbackAnswer] non-block id dropped: ${id}`);
        return false;
      }
      if (!isFallbackAnswerBlock(id as BlockId)) {
        console.warn(`[FallbackAnswer] block outside answer allowlist dropped: ${id}`);
        return false;
      }
      return true;
    });
    return requested.length > 0 ? requested : [EMPTY_STATE];
  }, [record_ids.join("|")]);

  const blocks = blockIds
    .map((id) => ({ id, Component: resolveBlock(id) }))
    .filter((b): b is { id: BlockId; Component: NonNullable<typeof b.Component> } =>
      b.Component !== null
    );

  if (blocks.length === 0) return null;

  return (
    <section className="sec-fallback-answer sec-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 col-12 mx-auto">
            {blocks.map(({ id, Component }) => (
              <FallbackBlock key={id}>
                <Component />
              </FallbackBlock>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
