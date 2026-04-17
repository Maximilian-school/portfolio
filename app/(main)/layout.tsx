import MainAppBar from "../appbar";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <MainAppBar>{children}</MainAppBar>;
}
