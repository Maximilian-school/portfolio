"use client";

import { TodoCategory, TodoList } from "@/app/api/todo/route";
import MarkdownRenderer from "@/app/markdown-stuff/MarkdownRenderer";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const [list, setList] = useState<TodoList | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { id } = await params;
                const res = await fetch(`/api/todo/${id}?id=${id}`);
                const data = await res.json();
                setList(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <p className="text-blue-500">Loading list!</p>
                </div>
            </div>
        );
    }

    if (!list) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-800">Error fetching list!</p>
                    <Link
                        className="text-blue-500 hover:underline mt-2 block"
                        href={"/blog/todo"}
                    >
                        Go back
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-8xl mx-auto px-4 py-12 space-y-8">
            <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold dark:text-gray-100 text-gray-900 mb-4">
                    {list.name}
                </h1>
                {list.description && (
                    <a className="font-semibold">{list.description}</a>
                )}
            </header>
            <div className="w-full overflow-auto flex py-2">
                {Object.entries(list.categories).map(
                    ([categoryId, category]) => {
                        const cardsInCategory = list.cards.filter(
                            (card) => card.category === categoryId
                        );

                        return (
                            <div
                                key={categoryId}
                                className="min-w-[260px] bg-gray-800 rounded-lg p-4 mr-4 h-fit"
                            >
                                <h3 className="text-xl font-bold text-gray-100 mb-4">
                                    {category.name}
                                </h3>

                                <div className="space-y-2">
                                    {cardsInCategory.length === 0 && (
                                        <p className="text-gray-400 text-sm italic">
                                            Nothing here!
                                        </p>
                                    )}

                                    {cardsInCategory.map((card, i) => (
                                        <div
                                            key={i}
                                            className="bg-gray-700 rounded-md p-3 text-gray-100"
                                        >
                                            <h4 className="text-lg font-bold text-gray-100 mb-4">
                                                {card.title}
                                            </h4>
                                            <div
                                                className="prose prose-md prose-slate max-w-[400px]
                                                                  prose-headings:font-bold dark:prose-headings:text-gray-100 prose-headings:text-gray-900
                                                                  dark:prose-p:text-gray-300 prose-p:text-gray-700 prose-p:leading-relaxed
                                                                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                                                                 dark:prose-strong:text-gray-100 prose-strong:text-gray-900 prose-strong:font-semibold
                                                                  prose-code:text-gray-200 prose-code:font-mono prose-code:font-light prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
                                                                  prose-pre:bg-transparent prose-pre:p-0
                                                                  prose-blockquote:border-l-4 prose-blockquote:text-gray-100 dark:prose-blockquote:text-gray-100 prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400 dark:prose-blockquote:bg-gray-600 prose-blockquote:bg-gray-100 prose-blockquote:py-2 prose-blockquote:px-4
                                                                  prose-ul:list-disc prose-ol:list-decimal
                                                                 dark:prose-li:text-gray-300 prose-li:text-gray-700
                                                                  prose-img:rounded-lg prose-img:shadow-lg"
                                            >
                                                <MarkdownRenderer
                                                    content={
                                                        card.description ??
                                                        "*No description*"
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
}
