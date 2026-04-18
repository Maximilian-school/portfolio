"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Explorer from "@/components/Explorer";

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
    return (
        <Explorer
            explorerName="Browse Games"
            initialData={GAMES_DATA}
            searchableFields={["title", "description"]}
            defaultSort="title"
            sortOptions={[
                { label: "Name", value: "title" },
                { label: "Release Date", value: "releaseDate" },
            ]}
            renderItem={(game) => (
                <div
                    key={game.id}
                    className="flex flex-col justify-between min-h-40 p-3 border border-[#b8d6e9] rounded-[3px] shadow-[2px_2px_0px_rgba(0,0,0,0.05)] bg-linear-to-b from-white to-[#f0f7fc]"
                >
                    <div>
                        <div className="flex items-start justify-between">
                            <h4 className="mb-2 text-[1.1rem] text-[#1e395b]">
                                {game.title}
                            </h4>

                            <span className="px-1 text-[10px] bg-blue-100 border border-blue-200">
                                {game.category}
                            </span>
                        </div>

                        <p className="text-[0.85rem] text-[#444] leading-[1.4]">
                            {game.description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-3 text-[0.75rem] text-[#666] border-t border-dotted border-[#bcd]">
                        <span>Added: {game.releaseDate}</span>

                        <Link
                            role="button"
                            href={game.link}
                            className="py-1 text-black no-underline"
                        >
                            Play
                        </Link>
                    </div>
                </div>
            )}
        />
    );
}
