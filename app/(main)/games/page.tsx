"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const GAMES_DATA = [
    {
        id: "the-switch",
        title: "The Switch",
        description:
            "Literally just a switch where the state is live broadcasted to all players!",
        link: "/games/the-switch",
        category: "Social",
        releaseDate: "2026-04-18",
    },
];

export default function Games() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("title");
    const [order, setOrder] = useState("asc");

    const filteredGames = useMemo(() => {
        return GAMES_DATA.filter(
            (game) =>
                game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                game.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
        ).sort((a, b) => {
            const valA = a[sortBy as keyof typeof a];
            const valB = b[sortBy as keyof typeof b];

            if (order === "asc") {
                return valA > valB ? 1 : -1;
            } else {
                return valA < valB ? 1 : -1;
            }
        });
    }, [searchTerm, sortBy, order]);

    return (
        <div className="flex flex-col max-w-4xl mx-auto gap-6">
            <fieldset>
                <legend>Game Directory</legend>
                <div className="field-row flex-wrap flex gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="search">Search:</label>
                        <input
                            id="search"
                            type="search"
                            className="p-1 border border-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Find a game..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label>Sort By:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-gray-400"
                        >
                            <option value="title">Name</option>
                            <option value="releaseDate">Release Date</option>
                        </select>
                        <select
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                            className="bg-white border border-gray-400"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
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
                }}
            >
                {filteredGames.map((game) => (
                    <div
                        key={game.id}
                        style={{
                            border: "1px solid #b8d6e9",
                            padding: "12px",
                            background:
                                "linear-gradient(to bottom, #ffffff 0%, #f0f7fc 100%)",
                            borderRadius: "3px",
                            boxShadow: "2px 2px 0px rgba(0,0,0,0.05)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            minHeight: "160px",
                        }}
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <h4
                                    style={{
                                        margin: "0 0 8px 0",
                                        color: "#1e395b",
                                        fontSize: "1.1rem",
                                    }}
                                >
                                    {game.title}
                                </h4>
                                <span className="text-[10px] bg-blue-100 px-1 border border-blue-200">
                                    {game.category}
                                </span>
                            </div>
                            <p
                                style={{
                                    margin: "0",
                                    fontSize: "0.85rem",
                                    color: "#444",
                                    lineHeight: "1.4",
                                }}
                            >
                                {game.description}
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
                            <span>Added: {game.releaseDate}</span>
                            <Link
                                role="button"
                                href={game.link}
                                className="text-black! no-underline! py-1!"
                            >
                                Play
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
