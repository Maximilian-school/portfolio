import { MetadataRoute } from "next";
import { supabase } from "../lib/supabaseClient";
import { gameList } from "./games/page";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://www.latific.click";
    const { data: posts, count } = await supabase
        .from("posts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(0, 100);
    const { data: lists, error } = await supabase
        .from("todolists")
        .select("*", { count: "exact" })
        .range(0, 100);

    const postEntries: MetadataRoute.Sitemap = (posts || []).map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.created_at),
        changeFrequency: "weekly" as const,
        priority: 1,
    }));

    const todoListEntries: MetadataRoute.Sitemap = (lists || []).map(
        (post) => ({
            url: `${baseUrl}/blog/todo/${post.id}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 1,
        })
    );

    const gameEntries: MetadataRoute.Sitemap = gameList.map((game) => ({
        url: `${baseUrl}${game.url}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.2,
    }));

    console.log(todoListEntries);

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "yearly" as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/games`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.5,
        },
        ...postEntries,
        ...gameEntries,
        ...todoListEntries,
    ];
}
