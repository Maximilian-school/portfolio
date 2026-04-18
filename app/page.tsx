import {
    CuboidIcon,
    GitBranch,
    Pickaxe,
    VideoIcon,
    WrenchIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import MainAppBar from "./windowframe";

const languages = [
    {
        name: "TypeScript",
        icon: <i className="devicon-typescript-plain colored" />,
    },
    {
        name: "JavaScript",
        icon: <i className="devicon-javascript-plain colored" />,
    },
    {
        name: "Lua/Luau",
        icon: <i className="devicon-lua-plain colored" />,
    },
    {
        name: "GDScript",
        icon: <i className="devicon-godot-plain colored" />,
    },
    {
        name: "Java",
        icon: <i className="devicon-java-plain colored" />,
    },
    {
        name: "C#",
        icon: <i className="devicon-csharp-plain colored" />,
    },
    {
        name: "HTML",
        icon: <i className="devicon-html5-plain colored" />,
    },
    {
        name: "CSS",
        icon: <i className="devicon-css3-plain colored" />,
    },
];

const frameworksAndEngines = [
    {
        name: "React",
        icon: <i className="devicon-react-plain colored" />,
    },
    {
        name: "Unity",
        icon: <i className="devicon-unity-plain colored" />,
    },
    {
        name: "Godot",
        icon: <i className="devicon-godot-plain colored" />,
    },
    {
        name: "Next.js",
        icon: <i className="devicon-nextjs-plain colored" />,
    },
    {
        name: "Minecraft Modding",
        icon: <Pickaxe />,
    },
    {
        name: "Supabase",
        icon: <i className="devicon-supabase-plain colored" />,
    },
    {
        name: "Firebase",
        icon: <i className="devicon-firebase-plain colored" />,
    },
    {
        name: "PostgreSQL",
        icon: <i className="devicon-postgresql-plain colored" />,
    },
    {
        name: "Tailwind CSS",
        icon: <i className="devicon-tailwindcss-plain colored" />,
    },
    {
        name: "Vercel",
        icon: <i className="devicon-vercel-plain colored" />,
    },
];

const links = [
    {
        name: "Youtube",
        icon: <VideoIcon />,
        href: "https://www.youtube.com/@maximilian11121",
    },
    {
        name: "Github",
        icon: <GitBranch />,
        href: "https://www.github.com/maximilian1121",
    },
    {
        name: "Modrinth",
        icon: <WrenchIcon />,
        href: "https://modrinth.com/user/Max111",
    },
    {
        name: "Roblox dev group",
        icon: <CuboidIcon />,
        href: "https://www.roblox.com/communities/33088361/Maximilians-dungeon",
    },
];

export default async function Home() {
    return (
        <MainAppBar>
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
                        I'm a hobby developer with a passion for creating games
                        and apps. I started programming at a young age and have
                        been learning ever since. I enjoy working on projects
                        that challenge me and allow me to learn new things.
                    </p>
                </span>

                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-semibold">Skills/Abilities</h1>
                    <h2 className="text-2xl font-semibold">Languages</h2>
                    <div className="max-h-32 flex flex-col gap-4 flex-wrap justify-center items-center w-full">
                        {languages.map((lang, index) => (
                            <div
                                key={index}
                                className="text-4xl flex items-center gap-4 w-fit"
                            >
                                {lang.icon}{" "}
                                <h1 className="text-lg">{lang.name}</h1>
                            </div>
                        ))}
                    </div>
                    <h2 className="text-2xl font-semibold">
                        Frameworks/Game engines
                    </h2>
                    <div className="max-h-32 flex flex-col gap-4 flex-wrap justify-center items-center w-full">
                        {frameworksAndEngines.map((eng, index) => (
                            <div
                                key={index}
                                className="text-4xl flex items-center gap-4 w-fit"
                            >
                                {eng.icon}{" "}
                                <h1 className="text-lg">{eng.name}</h1>
                            </div>
                        ))}
                    </div>
                </div>

                <span className="flex flex-col gap-4">
                    <h1 className="text-4xl font-semibold">Links</h1>
                    <div className="flex gap-6">
                        {links.map((link, index) => (
                            <Link
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                            >
                                {link.icon}{" "}
                                <h1 className="text-lg">{link.name}</h1>
                            </Link>
                        ))}
                    </div>
                </span>
            </main>
        </MainAppBar>
    );
}
