import { resolveBlock } from "@/lib/blockRegistry";
import type { BlockId } from "@/lib/viewContract";

/**
 * HowItWorksSection — renders a single pre-authored MDX block by ID.
 *
 * Resolution pattern lifted from FallbackAnswer.tsx: look up the block in
 * blockRegistry, render its component if found, render nothing if not
 * (contract invariant 5 — unknown IDs are dropped and logged, never an
 * empty shell, never a guess).
 *
 * Unlike FallbackAnswer, this takes exactly one required block — no
 * record_ids array, no FALLBACK_ANSWER_BLOCKS allowlist, no empty-state
 * substitution. The caller supplies the block; there is no "nothing matched"
 * case to paper over.
 */

interface HowItWorksSectionProps {
  blockId: BlockId;
}

export default function HowItWorksSection({ blockId }: HowItWorksSectionProps) {
  const Component = resolveBlock(blockId);

  if (!Component) {
    console.warn(`[HowItWorksSection] block did not resolve: ${blockId}`);
    return null;
  }

  return (
    <section className="sec-how-it-works sec-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 col-12 mx-auto">
            <Component />
          </div>
        </div>
      </div>
    </section>
  );
}
