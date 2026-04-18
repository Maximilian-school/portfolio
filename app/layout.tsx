import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import MainAppBar from "./windowframe";
import "./globals.css";
import "7.css";
import "devicon/devicon.min.css";
import Image from "next/image";

const notoSans = Noto_Sans({
    variable: "--font-noto-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Maximilian's amazing website",
    description: "My portfolio website built on Next and MUI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${notoSans.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col win7">
                <Image
                    src="/win7wp.jpg"
                    alt="Background"
                    fill
                    className="fixed top-0 left-0 object-cover -z-10 select-none"
                    draggable={false}
                />
                {children}
            </body>
        </html>
    );
}
