import { useEffect, useState } from "react";
import Tabs from "@/components/common/Tabs";
import { fetchCareerHighlights } from "@/lib/queries/careerHighlights";
import { mapCareerHighlightToCard } from "@/lib/templateGlossary";
import type { CareerHighlightRow } from "@/lib/templateGlossary";

type FetchState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "loaded"; data: CareerHighlightRow[] };

function HighlightList({ rows }: { rows: CareerHighlightRow[] }) {
    if (rows.length === 0) {
        return <p className="fs-7 text-600 mb-0">Nothing added yet.</p>;
    }
    return (
        <div className="d-flex flex-wrap gap-2">
            {rows.map((row) => {
                const card = mapCareerHighlightToCard(row);
                return (
                    <div
                        key={`${row.category}-${row.role_title}-${row.start_year}`}
                        className="block-experience p-4 rounded-16 border-200 flex-fill bg-white"
                    >
                        <span className="date p-2 rounded-pill bg-100 fs-8 fw-medium text-dark">{card.date}</span>
                        <h6 className="mb-0 mt-4">{card.title}</h6>
                        <p className="text-dark fs-7 my-2">{card.subtitle}</p>
                    </div>
                );
            })}
        </div>
    );
}

export default function Section4Client() {
    const [state, setState] = useState<FetchState>({ status: "loading" });

    useEffect(() => {
        let cancelled = false;
        fetchCareerHighlights()
            .then((data) => {
                if (!cancelled) setState({ status: "loaded", data });
            })
            .catch((err) => {
                if (!cancelled) setState({ status: "error", message: err?.message ?? "Unknown error" });
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (state.status === "loading") {
        return <p className="fs-7 text-600 mb-0">Loading…</p>;
    }

    if (state.status === "error") {
        return <p className="fs-7 text-600 mb-0">Something went wrong: {state.message}</p>;
    }

    const work = state.data.filter((row) => row.category === "work");
    const education = state.data.filter((row) => row.category === "education");

    return (
        <Tabs
            tabs={[
                { id: "tab1", title: "Work Experience", content: <HighlightList rows={work} /> },
                { id: "tab2", title: "Education", content: <HighlightList rows={education} /> },
            ]}
        />
    );
}
