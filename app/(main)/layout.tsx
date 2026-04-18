import MainAppBar from "../windowframe";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <MainAppBar>{children}</MainAppBar>;
}
