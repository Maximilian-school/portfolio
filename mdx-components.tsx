import { MDXComponents } from "mdx/types.js";
import { CustomImage } from "./components/mdx-components/CustomImage";
import { SteamGame } from "./components/mdx-components/SteamGame";
import Video from "./components/mdx-components/Video";
import { Window7 } from "./components/mdx-components/Window7";

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...components,
        SteamGame,
        img: CustomImage,
        Video,
        Window7,
    };
}
