"use client";

import { createClient } from "@/utils/supabase/client";
import { Modal, Tooltip } from "@mui/material";
import { Provider } from "@supabase/supabase-js";
import { SiDiscord, SiGithub, SiSpotify } from "react-icons/si";

const providers: {
    id: Provider;
    label: string;
    icon: React.ReactNode;
    fullWidth?: boolean;
}[] = [
    {
        id: "discord",
        label: "Continue with Discord",
        icon: <SiDiscord size={22} color="#7289da" />,
    },
    {
        id: "github",
        label: "Continue with GitHub",
        icon: <SiGithub size={22} color="#000" />,
    },
    {
        id: "spotify",
        label: "Continue with Spotify",
        icon: <SiSpotify size={22} color="#1db954" />,
        fullWidth: true,
    },
];

export default function SignInForm({
    open = false,
    onClose = (wasX: boolean) => {},
    help,
}: {
    open?: boolean;
    onClose?: (wasX: boolean) => void;
    help?: string;
}) {
    const supabase = createClient();

    const handleSignIn = async (provider: Provider) => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error(`Auth error (${provider}):`, error.message);
        }
    };

    return (
        <Modal
            open={open}
            onClose={() => {
                onClose(false);
            }}
            className="flex"
        >
            <div className="window active mx-auto w-lg aspect-video my-auto z-30">
                <div className="title-bar">
                    <div className="title-bar-text">Sign-in</div>
                    <div className="title-bar-controls">
                        {help && (
                            <Tooltip title={help}>
                                <button aria-label="Help"></button>
                            </Tooltip>
                        )}
                        <button
                            aria-label="Close"
                            onClick={() => {
                                onClose(true);
                            }}
                        />
                    </div>
                </div>

                <div className="window-body has-space h-full flex items-center justify-center">
                    <div className="w-full mx-8 flex flex-col gap-3">
                        <h1 className="text-2xl font-semibold">Sign-in</h1>

                        <label>Pick a provider and get rolling:</label>

                        <div className="flex flex-wrap gap-2 justify-center w-full">
                            {providers.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSignIn(p.id)}
                                    className={`flex items-center gap-2 py-2! px-3! ${
                                        p.fullWidth
                                            ? "w-full!"
                                            : "w-[calc(50%-0.25rem)]!"
                                    }`}
                                >
                                    {p.icon}
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
