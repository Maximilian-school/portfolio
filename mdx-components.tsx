import { MDXComponents } from "mdx/types.js";
import { CustomImage } from "./app/mdx-components/CustomImage";
import { SteamGame } from "./app/mdx-components/SteamGame";
import Video from "./app/mdx-components/Video";
import { Window7 } from "./app/mdx-components/Window7";

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...components,
        SteamGame,
        img: CustomImage,
        Video,
        Window7,
    };
}
