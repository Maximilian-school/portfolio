"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export type Profile = {
    id: string;
    username: string | null;
    avatar_url: string | null;
};

const supabase = createClient();

export function useUserClient() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        const instanceId = Math.random().toString(36).substring(7);

        const fetchFullData = async (currentUser: User) => {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", currentUser.id)
                    .maybeSingle();

                if (!isMounted) return;

                if (error) {
                    console.error(
                        `[DB ERROR] Instance: ${instanceId}:`,
                        error.message,
                    );
                } else {
                    setProfile(data);
                }
            } catch (err) {
                console.error(
                    `[CRITICAL] Instance: ${instanceId} crashed:`,
                    err,
                );
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (isMounted && session?.user) {
                setUser(session.user);
                fetchFullData(session.user);
            } else if (isMounted) {
                setLoading(false);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;

            if (session?.user) {
                setUser(session.user);
                fetchFullData(session.user);
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            controller.abort();
        };
    }, []);

    return { user, profile, loading };
}
