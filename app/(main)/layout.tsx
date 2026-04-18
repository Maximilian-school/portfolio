import MainAppBar from "@/components/windowframe";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <MainAppBar>{children}</MainAppBar>;
}
