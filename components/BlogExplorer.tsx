"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Blog } from "@/app/types";

export default function BlogExplorer({
    initialBlogs,
}: {
    initialBlogs: Blog[];
}) {
    const [blogs, setBlogs] = useState(initialBlogs);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [order, setOrder] = useState("desc");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const syncData = async () => {
            if (
                searchTerm === "" &&
                sortBy === "created_at" &&
                order === "desc" &&
                page === 1
            )
                return;

            setLoading(true);
            let query = supabase
                .from("blog")
                .select("*")
                .order(sortBy, { ascending: order === "asc" });

            if (searchTerm) {
                query = query.ilike("title", `%${searchTerm}%`);
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            const { data } = await query.range(0, 9);
            setBlogs(data || []);
            setLoading(false);
            setPage(1);
        };

        const timeoutId = setTimeout(syncData, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, sortBy, order]);

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        const from = page * 10;
        const { data } = await supabase
            .from("blog")
            .select("*")
            .order(sortBy, { ascending: order === "asc" })
            .range(from, from + 9);

        if (data && data.length > 0) {
            setBlogs((prev) => [...prev, ...data]);
            setPage((prev) => prev + 1);
        } else {
            setHasMore(false);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col max-w-4xl mx-auto gap-6">
            <fieldset>
                <legend>Library Tools</legend>
                <div className="field-row flex-wrap flex gap-2">
                    <div className="flex items-center gap-2">
                        <label htmlFor="search">Search:</label>
                        <input
                            id="search"
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search blog posts..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label>Sort:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="created_at">Date Modified</option>
                            <option value="title">Name</option>
                        </select>
                        <select
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>
            </fieldset>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "16px",
                    padding: "4px",
                }}
            >
                {blogs.map((blog) => (
                    <div
                        key={blog.id}
                        style={{
                            border: "1px solid #b8d6e9",
                            padding: "12px",
                            background:
                                "linear-gradient(to bottom, #ffffff 0%, #f0f7fc 100%)",
                            borderRadius: "3px",
                            boxShadow: "1px 1px 3px rgba(0,0,0,0.1)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            minHeight: "140px",
                        }}
                    >
                        <div>
                            <h4
                                style={{
                                    margin: "0 0 8px 0",
                                    color: "#1e395b",
                                    fontSize: "1.1rem",
                                }}
                            >
                                {blog.title}
                            </h4>
                            <p
                                style={{
                                    margin: "0",
                                    fontSize: "0.85rem",
                                    color: "#444",
                                    lineHeight: "1.4",
                                }}
                            >
                                {blog.content.substring(0, 100)}...
                            </p>
                        </div>
                        <div
                            style={{
                                marginTop: "12px",
                                paddingTop: "8px",
                                borderTop: "1px dotted #bcd",
                                fontSize: "0.75rem",
                                color: "#666",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span>
                                Created at:{" "}
                                {new Date(blog.created_at).toLocaleDateString()}
                            </span>
                            <Link
                                href={`/blog/${blog.slug}`}
                                role="button"
                                style={{ minWidth: "60px" }}
                                className="no-underline! text-black!"
                            >
                                Open
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && !searchTerm && (
                <div
                    className="field-row"
                    style={{ justifyContent: "center", padding: "20px" }}
                >
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        style={{ padding: "4px 20px" }}
                    >
                        {loading ? "Accessing..." : "Load More Items"}
                    </button>
                </div>
            )}

            <div className="status-bar" style={{ margin: "0 -8px -8px -8px" }}>
                <p className="status-bar-field">Items: {blogs.length}</p>
                <p className="status-bar-field">
                    State: {loading ? "Busy" : "Ready"}
                </p>
            </div>
        </div>
    );
}
