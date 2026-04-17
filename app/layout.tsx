import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import MainAppBar from "./appbar";
import "./globals.css";
import "7.css";

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
                <MainAppBar>{children}</MainAppBar>
            </body>
        </html>
    );
}
