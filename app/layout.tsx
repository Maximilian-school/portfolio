import "7.css";
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const notoSans = Noto_Sans({
    variable: "--font-noto-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Maximilian's amazing website",
    description: "My portfolio website built on Next and MUI",
};

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: {};
}>) {
    return (
        <html lang="en" className={`${notoSans.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col win7 overflow-hidden">
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
