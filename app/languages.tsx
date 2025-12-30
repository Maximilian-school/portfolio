import { IconType } from "react-icons"
import { DiCss3, DiHtml5, DiJava, DiPython, DiUnitySmall } from "react-icons/di"
import { SiGodotengine, SiJavascript, SiLua, SiTypescript } from "react-icons/si"

const languages: [string, IconType?, string?][] = [
  ["Python", DiPython, "https://www.python.org/"],
  ["Lua", SiLua, "https://www.lua.org/"],
  ["Javascript", SiJavascript, "https://nodejs.org/"],
  ["Typescript", SiTypescript, "https://www.typescriptlang.org/"],
  ["Java", DiJava, "https://www.java.com/"],
  ["CSS", DiCss3],
  ["HTML", DiHtml5],
  ["GD", SiGodotengine, "https://godotengine.org/"],
  ["C#", DiUnitySmall, "https://unity.com/"],
]

export default function Languages() {
  return (
    <div className="flex flex-wrap justify-center p-4 gap-2">
      {languages.map(([name, Icon, url]) => (
        <a href={url} key={name} className="text-lg mb-2 flex items-center gap-2 text-[#ededed] bg-blue-800 p-2 rounded-full border-2 border-blue-700 hover:translate-y-2 transition cursor-pointer">
          {Icon != null && <Icon className="rounded-full" />}
          <span>{name}</span>
        </a>
      ))}
    </div>
  )
}
