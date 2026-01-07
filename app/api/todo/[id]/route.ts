import { NextRequest, NextResponse } from "next/server";
import { TodoList } from "../route";
import { supabase } from "@/lib/supabaseClient";

export async function get_lists(): Promise<TodoList[] | null> {
    let { data, error } = await supabase.from("todolists").select("*");

    if (error) {
        console.error(error);
        return null;
    }

    return data;
}

export async function get_list(list_id: string): Promise<TodoList | null> {
    let { data, error } = await supabase
        .from("todolists")
        .select("*")
        .eq("id", list_id)
        .single();

    if (error) {
        console.error(error);
        return null;
    }

    return data;
}

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const list = await get_list(id);
    if (!list)
        return NextResponse.json({ error: "List not found" }, { status: 404 });

    return NextResponse.json(list);
}
