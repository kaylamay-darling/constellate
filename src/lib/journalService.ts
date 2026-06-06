// src/lib/journalService.ts
import { supabase } from "./supabaseClient";
import type { JournalEntry } from "../types/journal";

export const saveJournalEntry = async (
    entry: Omit<JournalEntry, "id" | "user_id" | "created_at">,
) => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User must be logged in to save entries");

    const { data, error } = await supabase
        .from("journal_entries")
        .insert([
            {
                user_id: user.id,
                daily_pulse: entry.daily_pulse,
                content: entry.content,
                addictions: entry.addictions,
            },
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
};
