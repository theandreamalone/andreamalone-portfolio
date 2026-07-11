import SectionTitle from "@/components/elements/TitleWhite";
import Section3Client from "./Section3Client";

export default function Section3() {
  return (
    <>
      {/*Home 2 Section 3*/}
      <section className="sec-3-home-2 sec-padding overflow-hidden">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <SectionTitle title="News in Category" description="Real-Time Updates That Matter" />
            </div>
          </div>
        </div>
        <div className="position-relative mt-4">
          <div className="container">
            <Section3Client />
          </div>
        </div>
      </section>
    </>
  );
}
