"use client";

import LoadingTemplate from "@/app/loading";
import Tumbleweed from "@/components/tumblweed";
import { useUserClient } from "@/hooks/use-user-client";
import { createClient } from "@/utils/supabase/client";
import { Modal, Tooltip } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { LuDelete, LuLogOut, LuTrash } from "react-icons/lu";

export default function Account() {
    const { user, profile, loading } = useUserClient();
    const supabase = createClient();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const router = useRouter();

    const [username, setUsername] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

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
            enqueueSnackbar({
                variant: "success",
                message:
                    "Sucessfully updated username! Please reload to see changes take effect!",
            });
        } catch (error: any) {
            let errorMessage = "An error occurred when chaning your username";
            switch (error?.code) {
                case "23514":
                    errorMessage =
                        "Your username is too long! Maximum 12 characters. Current: " +
                        username?.length;
                case "P0001":
                    errorMessage =
                        "Username contains foul language or vulgar references!";
            }
            enqueueSnackbar({ variant: "error", message: errorMessage });
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

    const deleteAcc = async () => {
        const response = await fetch("/account/delete", {
            method: "DELETE",
        });

        if (response.ok) {
            router.push("/");
        } else {
            enqueueSnackbar({
                variant: "error",
                message: "Error while deleting account!",
            });
        }
    };

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
                        <h1 className="py-8 text-2xl">
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

            <Modal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                className="flex items-center justify-center align-middle"
            >
                <div className="window active mx-auto w-sm my-auto z-30">
                    <div className="title-bar">
                        <div className="title-bar-text">Delete account</div>
                        <div className="title-bar-controls">
                            <button
                                aria-label="Close"
                                onClick={() => setDeleteOpen(false)}
                            />
                        </div>
                    </div>

                    <div className="window-body has-space h-full flex flex-col items-center justify-center">
                        <h1 className="text-2xl pt-5">Delete your account?</h1>
                        <p className="pb-5 text-lg">This is irreversible!</p>
                    </div>

                    <footer className="flex gap-2 justify-end">
                        <button className="default" onClick={deleteAcc}>
                            Yes
                        </button>
                        <button onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </button>
                    </footer>
                </div>
            </Modal>

            <div className="flex flex-col items-start text-left gap-6">
                <span className="flex gap-6 items-center">
                    <div className="relative w-20 h-20 sm:w-32 sm:h-32">
                        <Tooltip title="The reason I dont want people chaing their profile pictures to anything they want is becuase people could upload explicit content without me knowing and I could get in serious trouble!">
                            <Image
                                src={profile?.avatar_url ?? "/icon"}
                                alt="Profile Icon"
                                fill
                                unoptimized
                                className="object-cover rounded-full border border-gray-200"
                            />
                        </Tooltip>
                    </div>

                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            value={username ?? ""}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Set username"
                            spellCheck="false"
                            className={
                                ((username?.length ?? 0) > 12 &&
                                    "border-red-600!") +
                                " sm:text-4xl! text-2xl! h-fit! font-semibold sm:font-bold transition-colors"
                            }
                        />
                        <label
                            className={`${
                                (username?.length ?? 0) > 12
                                    ? "text-red-600"
                                    : "text-black"
                            } transition-colors`}
                        >
                            Maximum 12 characters, current{" "}
                            {username?.length ?? 0}
                        </label>

                        <button
                            onClick={handleUpdate}
                            disabled={updating}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all w-fit font-medium"
                        >
                            {updating ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </span>

                <span className="flex flex-col gap-1">
                    <button
                        className="py-2! px-8! mb-2 flex items-center gap-2 justify-center"
                        onClick={() => setLogoutOpen(true)}
                    >
                        <LuLogOut />
                        Log out
                    </button>
                    <label>Danger Zone:</label>
                    <span className="border-red-500 border rounded-md p-4">
                        <button
                            className="py-2! px-8! mb-2 flex items-center gap-2 justify-center"
                            onClick={() => setDeleteOpen(true)}
                        >
                            <LuTrash />
                            Delete account
                        </button>
                    </span>
                </span>
            </div>
        </div>
    );
}
