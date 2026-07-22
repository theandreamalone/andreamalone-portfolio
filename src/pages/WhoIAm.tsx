import Layout from "@/components/layout/Layout";
import Section1 from "@/components/sections/who-i-am/Section1";
import Stats from "@/components/sections/who-i-am/Stats";
import Section2 from "@/components/sections/who-i-am/Section2";
import CTABar from "@/components/sections/CTABar";

/**
 * WhoIAm — "Who I Am" (route: /page-about), the about template's layout
 * (hero + secondary section + closing CTA) rewired to real content:
 * headshot + reused positioning MDX + skill pills, Career Highlights in
 * place of the fake team grid, CTABar's real contact CTA in place of the
 * template's mailto-stub newsletter forms. PageAbout stays in the tree,
 * deprecated in place, unrouted — not deleted.
 */
export default function WhoIAm() {
  return (
    <>
      <Layout headerStyle={2} footerStyle={4}>
        <Section1 />
        <Stats />
        <Section2 />
        <CTABar variant="contact" />
      </Layout>
    </>
  );
}
