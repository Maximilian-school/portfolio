"use client";

import LoadingTemplate from "@/app/loading";
import Tumbleweed from "@/components/tumblweed";
import { useUserClient } from "@/hooks/use-user-client";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Account() {
    const { user, profile, loading } = useUserClient();
    const supabase = createClient();

    const [username, setUsername] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

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
    if (!user) return null;

    return (
        <div className="flex flex-col max-w-4xl mx-auto gap-6 items-center p-8">
            <Tumbleweed />
            <div className="flex items-center text-left gap-6">
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
                        disabled={updating || username === profile?.username}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all w-fit font-medium"
                    >
                        {updating ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
