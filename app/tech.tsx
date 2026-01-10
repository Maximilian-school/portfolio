import Image from "next/image";
import { IconType } from "react-icons";
import {
    SiFastapi,
    SiFirebase,
    SiFlask,
    SiGodotengine,
    SiRender,
    SiRobloxstudio,
    SiSupabase,
    SiUnity,
    SiVercel,
} from "react-icons/si";

const technologies: [string, any, string?][] = [
    ["Godot engine", SiGodotengine, "https://godotengine.org/"],
    ["Roblox studio", SiRobloxstudio, "https://create.roblox.com/"],
    ["Melon loader/Unity", SiUnity, "https://unity.com/"],
    ["Flask", SiFlask, "https://flask.palletsprojects.com/"],
    ["Fast API", SiFastapi, "https://fastapi.tiangolo.com/"],
    ["Vercel", SiVercel, "https://vercel.com"],
    ["Render", SiRender, "https://render.com"],
    ["Supabase", SiSupabase, "https://supabase.com"],
    ["Firebase", SiFirebase, "https://firebase.google.com"],
];

export default function Technologies() {
    return (
        <div className="flex flex-wrap justify-center p-4 gap-2">
            {technologies.map(([name, Icon, url]) => (
                <a
                    href={url}
                    key={name}
                    className="text-lg mt-2 flex items-center gap-2 text-[#ededed] bg-red-800 p-2 rounded-full border-2 border-red-700 hover:translate-y-2 transition cursor-pointer"
                >
                    {Icon != null && <Icon className="rounded-full" />}
                    <span>{name}</span>
                </a>
            ))}
        </div>
    );
}
