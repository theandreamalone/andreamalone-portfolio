import Layout from "@/components/layout/Layout";
import Section1 from "@/components/sections/portfolio-archive-1/Section1";
import Section6 from "@/components/sections/home-4/Section6";

export default function PortfolioArchive1() {
    return (
        <>
            <Layout headerStyle={2} footerStyle={4}>
                <Section1 />
                <Section6 />
            </Layout>
        </>
    );
}
