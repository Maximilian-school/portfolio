"use server";
import { supabase } from "../../../lib/supabaseClient";
import { get_lists } from "./[id]/route";

export type TodoCategory = {
    name: string;
};

export type TodoCard = {
    title: string;
    category: string;
    description: string | null;
};

export type TodoList = {
    id: string;
    name: string;
    description: string | null;
    categories: Record<string, TodoCategory>;
    cards: TodoCard[];
    listed: boolean;
};

export async function GET(req: Request) {
    const data: TodoList[] | null = await get_lists();

    if (data) {
        return new Response(JSON.stringify(data));
    } else {
        return new Response("sigma", { status: 500 });
    }
}
