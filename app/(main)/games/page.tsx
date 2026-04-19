"use client";

import Explorer from "@/components/Explorer";
import { createClient } from "@/utils/supabase/client";
import { Provider } from "@supabase/supabase-js";
import Link from "next/link";
import { SiDiscord, SiGithub, SiSpotify } from "react-icons/si";

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
    const supabase = createClient();

    const handleSignIn = async (provider: Provider) => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error(`Error signing in with ${provider}:`, error.message);
        }
    };

    return (
        <>
            <div className="flex flex-col max-w-4xl mx-auto gap-6">
                <h1 className="text-2xl font-semibold">
                    Please sign in to play <strong>some</strong> games!
                </h1>
                <label className="-mb-5 -mt-4">
                    Please choose one of the providers:
                </label>
                <span className="flex gap-4 mb-1 flex-wrap">
                    <button
                        onClick={() => handleSignIn("discord")}
                        className="flex items-center gap-2 w-fit py-2!"
                    >
                        <SiDiscord size={24} color="#7289da" /> Continue with
                        Discord
                    </button>
                    <button
                        onClick={() => handleSignIn("github")}
                        className="flex items-center gap-2 w-fit py-2!"
                    >
                        <SiGithub size={24} color="#000" /> Continue with Github
                    </button>
                    <button
                        onClick={() => handleSignIn("spotify")}
                        className="flex items-center gap-2 w-fit py-2!"
                    >
                        <SiSpotify size={24} color="#1db954" /> Continue with
                        Spotify
                    </button>
                </span>
            </div>
            <br />
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
        </>
    );
}
