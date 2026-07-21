import Link from "@/components/common/Link";
import Image from "@/components/common/Image";
import type { CaseStudyCardArchive1Data } from "@/lib/templateGlossary";

/**
 * ArticleCard11CaseStudy — archive-4's card visual (thumbnail-top, badge
 * overlaid on the image) rewired for case studies.
 *
 * Consumes the same CaseStudyCardArchive1Data shape as ArticleCard7
 * (archive-1's card) — the data never differed, only the layout did, so
 * this is a new component, not a new mapper. Blog-only fields from the
 * original ArticleCard11 (author avatar/name, comment count, reader count)
 * have no case-study equivalent and are dropped rather than fed demo data.
 *
 * Degrades gracefully: empty description or missing skill badges (some
 * case studies have no short_description yet) are hidden, never rendered
 * as blank/undefined.
 */

type CardProps = {
  card: CaseStudyCardArchive1Data;
  idx: number;
};

export default function ArticleCard11CaseStudy({ card, idx }: CardProps) {
  return (
    <div className="article card-11" key={idx}>
      <div className="card-img-top thumbnail">
        <Link href={card.linkPost}>
          {card.img && <Image src={card.img} alt={card.title} className="cover-image" width={500} height={350} />}
        </Link>
        {card.badge1 && (
          <Link href={card.linkBadge} className={`badge ${card.classBadge1} fs-8`}>
            {card.badge1}
          </Link>
        )}
        <Link
          href={card.linkVideo}
          className={`${card.layoutVideo} play-btn popup-video z-2 rounded-circle icon-shape icon-xl position-absolute top-50 start-50 translate-middle`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
            <path d="M7.6464 4.96873L18.1434 10.2052C19.6152 10.9418 19.6148 13.0388 18.1428 13.7748L7.6457 19.0391C6.3158 19.704 4.75 18.7388 4.75 17.2541L4.75 6.75335C4.75 5.26832 6.3165 4.30314 7.6464 4.96873Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
      <div className="card-body">
        <div className="card-corner">
          <Link href={card.linkPost} className="arrow-box">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
              <path d="M13.75 6.75L19.25 12L13.75 17.25" stroke="#0E0E0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 12H4.75" stroke="#0E0E0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="curve-one" />
          <div className="curve-two" />
        </div>
        <div className="left pe-5">
          <Link href={card.linkPost}>
            <h5 className="card-title mb-0 text-truncate-2">{card.title}</h5>
          </Link>
          {card.description && (
            <p className="card-text text-600 fs-7 mb-0 mt-4 text-truncate-2">{card.description}</p>
          )}
          <div className="bottom mt-auto d-flex flex-wrap align-items-center gap-2 pt-4">
            {card.badge2 && card.classBadge2 !== "d-none" && (
              <Link href={card.linkBadge} className={`badge ${card.classBadge2} fs-8`}>
                {card.badge2}
              </Link>
            )}
            {card.readTime && (
              <ul className="d-flex align-items-center gap-4 text-600 m-0 ps-3">
                <li>
                  <p className="fs-8 m-0">{card.readTime}</p>
                </li>
              </ul>
            )}
          </div>
        </div>
        <div className="right">
          <Link href="#" className="book-mark">
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 20 20" fill="none">
              <path d="M5.625 5.62498C5.625 4.7045 6.37119 3.95831 7.29167 3.95831H12.7083C13.6288 3.95831 14.375 4.7045 14.375 5.62498V16.0416L10 12.2916L5.625 16.0416V5.62498Z" stroke="#626568" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
