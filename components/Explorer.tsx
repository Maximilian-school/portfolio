"use client";

import { Divider } from "@mui/material";
import { useState, useEffect, useMemo } from "react";

export default function Explorer({
    explorerName = "Explorer",
    initialData = [],
    fetchData,
    searchableFields,
    sortOptions,
    defaultSort,
    renderItem,
    pageSize = 10,
}: {
    explorerName?: string;
    initialData?: any[];
    fetchData?: (opts: {
        search: string;
        sortBy: string;
        order: string;
        page: number;
        pageSize: number;
    }) => Promise<{ data: any[]; hasMore: boolean }>;
    searchableFields: string[];
    sortOptions: { label: string; value: string }[];
    defaultSort: string;
    renderItem: (item: any) => React.ReactNode;
    pageSize?: number;
}) {
    const [data, setData] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState(defaultSort);
    const [order, setOrder] = useState("desc");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const isAsync = !!fetchData;

    useEffect(() => {
        if (!isAsync) return;

        const run = async () => {
            setLoading(true);
            const res = await fetchData!({
                search: searchTerm,
                sortBy,
                order,
                page: 1,
                pageSize,
            });

            setData(res.data);
            setHasMore(res.hasMore);
            setPage(1);
            setLoading(false);
        };

        const t = setTimeout(run, 300);
        return () => clearTimeout(t);
    }, [searchTerm, sortBy, order]);

    const clientData = useMemo(() => {
        if (isAsync) return data;

        return [...data]
            .filter((item) =>
                searchableFields.some((field) =>
                    String(item[field])
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                ),
            )
            .sort((a, b) => {
                const valA = a[sortBy];
                const valB = b[sortBy];

                if (order === "asc") return valA > valB ? 1 : -1;
                return valA < valB ? 1 : -1;
            });
    }, [data, searchTerm, sortBy, order]);

    const displayData = isAsync ? data : clientData;

    const loadMore = async () => {
        if (!isAsync || loading || !hasMore) return;

        setLoading(true);
        const res = await fetchData!({
            search: searchTerm,
            sortBy,
            order,
            page,
            pageSize,
        });

        setData((prev) => [...prev, ...res.data]);
        setHasMore(res.hasMore);
        setPage((p) => p + 1);
        setLoading(false);
    };

    return (
        <div className="flex flex-col max-w-4xl mx-auto gap-6">
            <fieldset>
                <legend>{explorerName}</legend>

                <div className="flex gap-2 flex-wrap items-center">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="mr-2"
                    />
                    <label id="sort-by-label">Sort by:</label>
                    <select
                        aria-labelledby="sort-by-label"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <label id="order-label">Order:</label>
                    <select
                        aria-labelledby="order-label"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </fieldset>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "16px",
                }}
            >
                {displayData.map((item, i) => (
                    <div key={i}>{renderItem(item)}</div>
                ))}
            </div>

            {isAsync && hasMore && !searchTerm && (
                <div className="flex justify-center p-5">
                    <button onClick={loadMore} disabled={loading}>
                        {loading ? "Accessing..." : "Load More Items"}
                    </button>
                </div>
            )}

            <div className="status-bar">
                <p className="status-bar-field">Items: {displayData.length}</p>
                <p className="status-bar-field">
                    State: {loading ? "Busy" : "Ready"}
                </p>
            </div>
        </div>
    );
}
