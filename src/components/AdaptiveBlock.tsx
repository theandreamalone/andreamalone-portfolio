import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Eagerly bundles every MDX file under content/blocks at build time —
// so rendering a block never depends on a runtime file fetch.
const blockModules = import.meta.glob("/content/blocks/*.mdx", { eager: true });

function getBlockComponent(slug: string) {
  const match = Object.entries(blockModules).find(([path]) => path.endsWith(`${slug}.mdx`));
  return match ? (match[1] as any).default : null;
}

export default function AdaptiveBlock({
  blockPrefix,
  audience = "recruiter",
  fallback,
}: { blockPrefix: string; audience?: string; fallback: React.ReactNode }) {
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("content_blocks")
      .select("block_slug")
      .ilike("block_slug", `${blockPrefix}%`)
      .eq("status", "published")
      .contains("audience", [audience])
      .order("sort_order")
      .limit(1)
      .then((result: { data: { block_slug: string }[] | null; error: unknown }) => {
        if (result.error || !result.data?.length) return; // static fallback stays on screen
        setResolvedSlug(result.data[0].block_slug);
      });
  }, [blockPrefix, audience]);

  const Component = resolvedSlug ? getBlockComponent(resolvedSlug) : null;
  return Component ? <Component /> : <>{fallback}</>;
}
