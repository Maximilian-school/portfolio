"use client";

import { TodoCategory, TodoList } from "@/app/api/todo/route";
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
        <div className="max-w-8xl py-12 space-y-8 mx-4 md:mx-auto px-16">
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
                                            <p className="block max-w-[400px] wrap-break-word whitespace-pre-wrap text-md text-gray-200">
                                                {card.description ??
                                                    "No description"}
                                            </p>
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
