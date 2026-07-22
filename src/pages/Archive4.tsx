import Layout from "@/components/layout/Layout";

import Breadcumb from "@/components/elements/breadcumb";
import Section1 from "@/components/sections/archive-4/Section1";
import Section3 from "@/components/sections/home-4/Section6";

export default function Archive_4() {
    return (
        <>
            <Layout footerStyle={4}>
                <Breadcumb page_current="Trends" title="Trends" count_articles="85" description="Journey across the globe to uncover the stories, traditions, and beauty that shape our shared human experience." />
                <Section1 />
                <Section3 />
            </Layout>
        </>
    );
}
