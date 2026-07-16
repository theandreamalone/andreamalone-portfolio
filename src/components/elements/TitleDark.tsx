import Link from "@/components/common/Link";

/**
 * TitleDark — section title bar, also serving as the parameterized CTA bar
 * (templateGlossary decision #12).
 *
 * linkHref and linkLabel were hardcoded to "/archive-3" / "View More" — blog
 * archive routing. They are now optional props defaulting to the original
 * values, so existing call sites (home-2/Section4, home-2/Section6) are
 * unchanged.
 *
 * Pass showLink={false} to hide the link entirely.
 */

interface TitleDarkProps {
  title: string;
  description: string;
  classList?: string;
  linkHref?: string;
  linkLabel?: string;
  showLink?: boolean;
}

export default function TitleDark({
  title,
  description,
  classList,
  linkHref = "/archive-3",
  linkLabel = "View More",
  showLink = true,
}: TitleDarkProps) {
  return (
    <>
      <div className={`section-title dark ${classList ?? ""} d-flex align-items-center justify-content-between flex-wrap gap-3`}>
        <div className="d-flex">
          <div className="d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
              <path d="M0.582044 11.7285C8.79451 13.4712 10.252 14.8614 12.125 22.7372C13.8067 14.8768 15.2308 13.4992 23.4018 11.8279C15.1894 10.0852 13.7319 8.69503 11.8589 0.81924C10.1769 8.67956 8.75306 10.0571 0.582044 11.7285Z" fill="#0E0E0F" />
            </svg>
            <h5 className="mb-0">{title}</h5>
          </div>
          {description && <p className="fs-7 ms-3 mb-2 d-none d-lg-block">{description}</p>}
        </div>
        {showLink && (
          <div className="d-none d-md-block">
            <Link href={linkHref} className="view-more white">
              <span className="circle" aria-hidden="true">
                <span className="icon arrow" />
              </span>
              <span className="button-text">{linkLabel}</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
