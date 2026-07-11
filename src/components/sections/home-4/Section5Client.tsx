import { useState } from "react";
import ArticleCard9 from "@/components/cards/ArticleCard9";
import DataCard from "@/data/cardHome-4.json";
import Paginationpage from "@/components/elements/Pagination";

export default function Section5Client() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage9 = 5;

    const totalPages9 = Math.ceil(DataCard.sec5Card9.length / itemsPerPage9);
    const totalPages = Math.max(totalPages9);

    const paginatedArticles9 = DataCard.sec5Card9.slice((currentPage - 1) * itemsPerPage9, currentPage * itemsPerPage9);

    return (
        <>
            {paginatedArticles9.map((card, idx) => (
                <div key={idx} className="col-12">
                    <ArticleCard9 card={card} idx={idx} />
                </div>
            ))}

            <div className="col-12 d-flex justify-content-start align-items-center">
                <Paginationpage
                    classList="d-flex justify-content-start align-items-center"
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </>
    );
}
