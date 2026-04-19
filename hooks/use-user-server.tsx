"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getAuthClaims() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const {
            data: { session },
            error: authError,
        } = await supabase.auth.getSession();

        if (authError || !session) return { user: null, profile: null };

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

        return {
            user: session.user,
            profile: profile || null,
        };
    } catch (e) {
        return { user: null, profile: null };
    }
}
