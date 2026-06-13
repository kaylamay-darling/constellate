import { supabase } from './supabaseClient';

export interface AdictionTrackingData {
    name: string;
    color: string;
    urges: string[];
    relapses: string[];
    currentStreak: number;
    longestStreak: number;
    averageUrgesPerWeekday: number[];
    currentWeekUrges: number[];
}

const COLORS = [
    '#b8a9ff', '#ff9eb5', '#90e0c4', '#ffd97d',
    '#a0c4ff', '#ffb347', '#c9b1ff', '#80ffdb'
];

const MILESTONES = [1, 3, 7, 14, 30, 90, 180, 365];

function getWeekdayIndex(date: Date): number {
    return (date.getDay() + 6) % 7;
}

function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function computeCurrentStreak(relapses: string[], startDate: string): number {
    const lastRelapse = relapses.length > 0
        ? new Date(relapses.reduce((a, b) => new Date(a) > new Date(b) ? a : b))
        : null;

    const from = lastRelapse
        ? lastRelapse
        : new Date(startDate);

    const diffMs = Date.now() - from.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function computeLongestStreak(relapses: string[], startDate: string): number {
    if (relapses.length === 0) return computeCurrentStreak([], startDate);

    const sorted = [...relapses]
        .map(r => new Date(r))
        .sort((a, b) => a.getTime() - b.getTime());

    let longest = 0;
    let prev = new Date(startDate);

    for (const relapse of sorted) {
        const days = Math.floor((relapse.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (days > longest) longest = days;
        prev = relapse;
    }

    const current = computeCurrentStreak(relapses, startDate);
    return Math.max(longest, current);
}

function computeAverageUrgesPerWeekday(urges: string[]): number[] {
    const counts = Array(7).fill(0);
    const weekCounts = Array(7).fill(0);

    for (const urge of urges) {
        const date = new Date(urge);
        const day = getWeekdayIndex(date);
        counts[day]++;
    }

    if (urges.length > 0) {
        const first = new Date(urges.reduce((a, b) => new Date(a) < new Date(b) ? a : b));
        const now = new Date();
        const totalDays = Math.floor((now.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));

        for (let i = 0; i <= totalDays; i++) {
            const d = new Date(first);
            d.setDate(first.getDate() + i);
            weekCounts[getWeekdayIndex(d)]++;
        }
    }

    return counts.map((count, i) =>
        weekCounts[i] > 0 ? count / weekCounts[i] : 0
    );
}

function computeCurrentWeekUrges(urges: string[]): number[] {
    const counts = Array(7).fill(0);
    const monday = getMonday(new Date());
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    for (const urge of urges) {
        const date = new Date(urge);
        if (date >= monday && date <= sunday) {
            counts[getWeekdayIndex(date)]++;
        }
    }

    return counts;
}

export async function fetchSobrietyTrackingData(): Promise<AdictionTrackingData[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('addictions')
        .select('name, start_date, urges, relapses')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((row, i) => ({
        name: row.name,
        color: COLORS[i % COLORS.length],
        urges: row.urges ?? [],
        relapses: row.relapses ?? [],
        currentStreak: computeCurrentStreak(row.relapses ?? [], row.start_date),
        longestStreak: computeLongestStreak(row.relapses ?? [], row.start_date),
        averageUrgesPerWeekday: computeAverageUrgesPerWeekday(row.urges ?? []),
        currentWeekUrges: computeCurrentWeekUrges(row.urges ?? []),
    }));
}

export { MILESTONES };

export function getMilestoneLabel(days: number): string {
    if (days === 1) return '1 Day';
    if (days === 3) return '3 Days';
    if (days === 7) return '1 Week';
    if (days === 14) return '2 Weeks';
    if (days === 30) return '1 Month';
    if (days === 90) return '3 Months';
    if (days === 180) return '6 Months';
    if (days === 365) return '1 Year';
    return `${days} Days`;
}
