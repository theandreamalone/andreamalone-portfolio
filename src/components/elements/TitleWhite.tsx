import Link from "@/components/common/Link";


type TitleWhiteProps = {
  title: string;
  description: string;
  classList?: string;
  linkHref?: string;
  linkLabel?: string;
};

export default function TitleWhite({ title, description, linkHref, linkLabel }: TitleWhiteProps) {
  // The link renders ONLY when a caller provides linkHref. The template
  // hardcoded "View More → /archive-3" on every instance, which (a) sent the
  // CTABar's link to a template demo page instead of bar.linkHref, and
  // (b) occupied the top-right slot where the testimonial carousel parks its
  // prev/next arrows (top:-80px) — the two overlapped. Section titles that
  // don't pass a link now leave that slot free.
  return (
    <>
      <div className="section-title d-flex align-items-center justify-content-between gap-3">
        <div className="d-flex">
          <div className="d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
              <path d="M0.582044 11.7285C8.79451 13.4712 10.252 14.8614 12.125 22.7372C13.8067 14.8768 15.2308 13.4992 23.4018 11.8279C15.1894 10.0852 13.7319 8.69503 11.8589 0.81924C10.1769 8.67956 8.75306 10.0571 0.582044 11.7285Z" fill="#0E0E0F" />
            </svg>
            <h5 className="mb-0">{title}</h5>
          </div>
          <p className="fs-7 ms-3 mb-2 d-none d-lg-block">{description}</p>
        </div>
        {linkHref && (
          <div className="d-none d-md-block">
            <Link href={linkHref} className="view-more">
              <span className="circle" aria-hidden="true">
                <span className="icon arrow" />
              </span>
              <span className="button-text">{linkLabel ?? "View More"}</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
