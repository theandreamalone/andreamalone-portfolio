import Layout from "@/components/layout/Layout";
import Section1 from "@/components/sections/what-i-do/Section1";
import Section2 from "@/components/sections/home-4/Section6";

/**
 * WhatIDo — "What I Do" (route: /case-studies), archive-4's layout with
 * live Supabase case-study data instead of blog demo JSON. Supersedes
 * master-plan item 16 (Archive1 Supabase wiring). PortfolioArchive1 stays
 * in the tree, deprecated in place, unrouted — not deleted.
 */
export default function WhatIDo() {
  return (
    <>
      <Layout headerStyle={2} footerStyle={4}>
        <Section1 />
        <Section2 />
      </Layout>
    </>
  );
}
