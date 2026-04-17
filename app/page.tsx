import Image from "next/image";

export default async function Home() {
    return (
        <main className="flex flex-col max-w-4xl mx-auto gap-6">
            {/* Profile Section */}
            <div className="flex items-center text-left gap-6">
                <Image src="/icon" alt="Icon" width={256} height={256} />
                <span>
                    <h1 className="text-4xl font-bold mb-4">Maximilian</h1>
                    <h2 className="text-xl font-semibold">
                        Hobby dev (Games/Apps)
                    </h2>
                </span>
            </div>

            <span className="flex flex-col gap-4">
                <h1 className="text-4xl font-semibold">Biography</h1>
                <p className="text-lg">
                    I'm a hobby developer with a passion for creating games and
                    apps. I started programming at a young age and have been
                    learning ever since. I enjoy working on projects that
                    challenge me and allow me to learn new things.
                </p>
            </span>

            <span className="flex flex-col gap-4">
                <h1 className="text-4xl font-semibold">Skills/Abilities</h1>
            </span>
        </main>
    );
}
