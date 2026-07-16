import Layout from "@/components/layout/Layout";
import HowItWorksSection from "@/components/HowItWorksSection";
import type { BlockId } from "@/lib/viewContract";

const BLOCK_IDS: readonly BlockId[] = [
  'block:how-it-works-hook',
  'block:how-it-works-problem',
  'block:how-it-works-layers',
  'block:how-it-works-constraint',
  'block:how-it-works-demo',
];

export default function HowItWorks() {
  return (
    <Layout>
      {BLOCK_IDS.map((id) => (
        <HowItWorksSection key={id} blockId={id} />
      ))}
    </Layout>
  );
}
