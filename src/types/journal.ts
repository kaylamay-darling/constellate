export interface DailyPulse {
    mood: number | null;
    energy: number | null;
    affect: number | null;
    anxiety: number | null;
}

export interface Addiction {
    name: string;
    urges: string[];
    relapses: string[];
    startDate: string;
}

export interface JournalAddictionEvent {
    urge: boolean;
    relapse: boolean;
}

export interface JournalEntry {
    id: string;
    user_id: string;
    created_at: string;
    daily_pulse: DailyPulse;
    content: string;
    addictions: Record<string, JournalAddictionEvent>;
}