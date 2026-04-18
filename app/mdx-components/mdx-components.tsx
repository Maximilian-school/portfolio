import { CustomImage } from "./CustomImage";
import { SteamGame } from "./SteamGame";
import Video from "./Video";
import { Window7 } from "./Window7";

export default function MDXComponents() {
    return {
        SteamGame,
        img: CustomImage,
        Video,
        Window7,
    };
}
