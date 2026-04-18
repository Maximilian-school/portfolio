"use client";

import Loading from "@/app/(main)/blog/[slug]/loading";
import { Gamepad, HomeIcon, MenuSquare, ScrollIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";

const navItems = [
    { label: "Home", icon: <HomeIcon size={16} />, href: "/" },
    { label: "Blog", icon: <ScrollIcon size={16} />, href: "/blog" },
    { label: "Projects", icon: <MenuSquare size={16} />, href: "/projects" },
    { label: "Games", icon: <Gamepad size={16} />, href: "/games" },
];

export default function MainAppBar({
    children,
}: {
    children: React.ReactNode;
}) {
    const windowRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const [dynamicTitle, setDynamicTitle] = useState("");

    useEffect(() => {
        const handleEvent = (e: any) => setDynamicTitle(e.detail);
        window.addEventListener("set-breadcrumb", handleEvent);

        return () => {
            window.removeEventListener("set-breadcrumb", handleEvent);
            setDynamicTitle("");
        };
    }, [pathname]);

    const pathSegments = pathname.split("/").filter(Boolean);

    return (
        <div className="max-h-dvh h-dvh w-screen sm:p-2 m-0 overflow-hidden bg-transparent">
            <div
                className="window glass active h-full w-full flex flex-col"
                ref={windowRef}
            >
                <div className="title-bar">
                    <div className="title-bar-text flex items-center gap-2">
                        <Image src="/icon" alt="Icon" width={16} height={16} />{" "}
                        Maximilian's amazing site
                    </div>
                    <div className="title-bar-controls">
                        <button aria-label="Minimize" disabled />
                        <button
                            aria-label="Maximize"
                            onClick={() => {
                                if (document.fullscreenEnabled) {
                                    document.exitFullscreen();
                                }
                                if (windowRef.current) {
                                    windowRef.current.requestFullscreen();
                                }
                            }}
                        />
                        <button
                            aria-label="Close"
                            onClick={() => {
                                if (document.fullscreenEnabled) {
                                    document.exitFullscreen();
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="window-body overflow-hidden flex flex-col h-screen">
                    <nav className="relative top-0 left-0 border-b border-gray-300 flex flex-col gap-2 px-4 py-2 bg-(--w7-surface) w-full overflow-x-auto overflow-y-hidden">
                        <span className="flex gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    passHref
                                    className="no-underline! !hover:no-underline"
                                >
                                    <button className="flex items-center gap-1.5">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                </Link>
                            ))}
                        </span>

                        <div aria-label="breadcrumb" className="flex gap-1">
                            <Link
                                href="/"
                                className={`underline ${pathSegments.length === 0 ? "text-black!" : "text-black/70!"}`}
                            >
                                Home
                            </Link>

                            {pathSegments.map((segment, index) => {
                                const isLast =
                                    index === pathSegments.length - 1;
                                const href = `/${pathSegments.slice(0, index + 1).join("/")}`;

                                let label =
                                    isLast && dynamicTitle
                                        ? dynamicTitle
                                        : navItems.find((n) => n.href === href)
                                              ?.label || segment;

                                return (
                                    <React.Fragment key={href}>
                                        <p className="text-black/70!">/</p>
                                        <Link
                                            href={href}
                                            aria-current={
                                                isLast ? "page" : undefined
                                            }
                                            className={`capitalize underline ${
                                                isLast
                                                    ? "text-black!"
                                                    : "text-black/70!"
                                            }`}
                                        >
                                            {label}
                                        </Link>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </nav>

                    <main className="flex-1 overflow-auto text-black has-scrollbar p-2">
                        <Suspense fallback={<Loading />}>{children}</Suspense>
                    </main>
                </div>
            </div>
        </div>
    );
}
