"use server";

import { Gamepad, HomeIcon, MenuSquare, ScrollIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";
import Loading from "./loading";

const navItems = [
    { label: "Home", icon: <HomeIcon size={16} />, href: "/" },
    { label: "Blog", icon: <ScrollIcon size={16} />, href: "/blog" },
    { label: "Projects", icon: <MenuSquare size={16} />, href: "/projects" },
    { label: "Games", icon: <Gamepad size={16} />, href: "/games" },
];

export default async function MainAppBar({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen w-screen p-2 m-0 overflow-hidden bg-transparent">
            <div className="window glass active h-full w-full flex flex-col">
                <div className="title-bar">
                    <div className="title-bar-text flex items-center gap-2">
                        <Image src="/icon" alt="Icon" width={16} height={16} />{" "}
                        Maximilian's amazing site
                    </div>
                    <div className="title-bar-controls">
                        <button aria-label="Minimize" />
                        <button aria-label="Maximize" />
                        <button aria-label="Close" />
                    </div>
                </div>

                <div className="window-body flex flex-col flex-grow overflow-hidden">
                    <nav className="flex gap-3 p-2 border-b border-gray-300 hide-on-mobile">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                passHref
                                className="!no-underline !hover:no-underline"
                            >
                                <button className="flex items-center gap-1.5">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            </Link>
                        ))}
                    </nav>

                    <main className="flex-none p-5 overflow-y-auto bg-white/80 text-black">
                        <Suspense fallback={<Loading />}>{children}</Suspense>
                    </main>
                </div>
            </div>
        </div>
    );
}
