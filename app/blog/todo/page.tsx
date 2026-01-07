import { TodoList } from "@/app/api/todo/route";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

interface TodoPageProps {
    searchParams?: Promise<{ page?: string }>;
}

export default async function TodoPage({ searchParams }: TodoPageProps) {
    const params = await searchParams;
    const page = parseInt(params?.page || "1", 10);
    const perPage = 10;

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data: lists, count } = await supabase
        .from("todolists")
        .select("*", { count: "exact" })
        .eq("listed", true)
        .range(from, to);

    const pageCount = Math.ceil((count ?? 0) / perPage);

    return (
        <div className="max-w-3xl py-12 space-y-8 mx-2 md:mx-auto">
            {lists?.map((post: TodoList) => (
                <div
                    key={post.id}
                    className="p-4 border rounded-md hover:shadow-lg transition"
                >
                    <h2 className="text-xl font-semibold dark:text-gray-300 text-gray-900">
                        {post.name}
                    </h2>
                    <div className="line-clamp-3 dark:text-gray-300 text-gray-900"></div>
                    <Link
                        href={`/blog/todo/${post.id}`}
                        className="text-blue-500 hover:underline mt-2 block"
                    >
                        Open todo list
                    </Link>
                </div>
            ))}

            <div className="flex gap-3 justify-center items-center dark:text-gray-300">
                {page > 1 && (
                    <Link
                        href={`/blog/todo?page=${page - 1}`}
                        className="h-10 px-4 flex items-center justify-center bg-gray-700 text-gray-900 rounded-md cursor-pointer"
                    >
                        Previous
                    </Link>
                )}

                <span>
                    Page {page} of {pageCount}
                </span>

                {page < pageCount && (
                    <Link
                        href={`/blog/todo?page=${page + 1}`}
                        className="h-10 px-4 flex items-center justify-center bg-gray-700 text-gray-900 cursor-pointer"
                    >
                        Next
                    </Link>
                )}
            </div>

            <div className="w-full fixed text-center left-0 right-0 bottom-16 flex justify-center">
                <a
                    href="/blog"
                    className="text-blue-500 hover:underline mt-2 block w-fit"
                >
                    Go to back to blog
                </a>
            </div>
        </div>
    );
}
