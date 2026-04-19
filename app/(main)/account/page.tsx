"use client";

import LoadingTemplate from "@/app/loading";
import Tumbleweed from "@/components/tumblweed";
import { useUserClient } from "@/hooks/use-user-client";
import { createClient } from "@/utils/supabase/client";
import { Modal } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Account() {
    const { user, profile, loading } = useUserClient();
    const supabase = createClient();

    const [username, setUsername] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);

    // Sync local state when profile loads
    useEffect(() => {
        if (profile) setUsername(profile.username);
    }, [profile]);

    const handleUpdate = async () => {
        if (!user?.id) return;

        setUpdating(true);

        try {
            const { data, error } = await supabase
                .from("profiles")
                .update({ username })
                .eq("id", user.id)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setUsername(data.username);
            }
        } catch (error: any) {
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <LoadingTemplate />;
    if (!user)
        return (
            <div className="flex flex-col max-w-4xl mx-auto gap-2 items-center p-8">
                <h1 className="text-4xl">You seem lost!</h1>
                <p className="text-xl">You arent signed in!</p>
                <Link
                    role="button"
                    href="/"
                    className="no-underline! text-black!"
                >
                    Go home!
                </Link>
            </div>
        );

    return (
        <div className="flex flex-col max-w-4xl mx-auto gap-6 items-center p-8">
            <Tumbleweed />
            <Modal
                open={logoutOpen}
                onClose={() => setLogoutOpen(false)}
                className="flex items-center justify-center align-middle"
            >
                <div className="window active mx-auto w-sm my-auto z-30">
                    <div className="title-bar">
                        <div className="title-bar-text">Logout</div>
                        <div className="title-bar-controls">
                            <button
                                aria-label="Close"
                                onClick={() => setLogoutOpen(false)}
                            />
                        </div>
                    </div>

                    <div className="window-body has-space h-full flex items-center justify-center">
                        <h1 className="py-8 text-lg">
                            Are you sure you want to log out?
                        </h1>
                    </div>

                    <footer className="flex gap-2 justify-end">
                        <button
                            className="default"
                            onClick={() => {
                                supabase.auth.signOut();
                            }}
                        >
                            Yes
                        </button>
                        <button onClick={() => setLogoutOpen(false)}>
                            Cancel
                        </button>
                    </footer>
                </div>
            </Modal>
            <div className="flex flex-col items-start text-left gap-6">
                <span className="flex gap-6">
                    <div className="relative w-20 h-20 sm:w-32 sm:h-32">
                        <Image
                            src={profile?.avatar_url ?? "/default-avatar.png"} // Added a fallback
                            alt="Profile Icon"
                            fill
                            unoptimized
                            className="object-cover rounded-full border border-gray-200"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            value={username ?? ""}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Set username"
                            spellCheck="false"
                            className="sm:text-4xl! text-2xl! h-fit! font-semibold sm:font-bold bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none transition-colors"
                        />

                        <button
                            onClick={handleUpdate}
                            disabled={
                                updating || username === profile?.username
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all w-fit font-medium"
                        >
                            {updating ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </span>

                <span className="flex flex-col gap-1">
                    <label>Danger Zone:</label>
                    <span className="border-red-500 border rounded-md p-4 ">
                        <button
                            className="py-2! px-8!"
                            onClick={() => setLogoutOpen(true)}
                        >
                            Log out
                        </button>
                    </span>
                </span>
            </div>
        </div>
    );
}
