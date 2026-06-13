import { useState } from 'react';
import type { AdictionTrackingData } from '../lib/sobrietyTrackingService';
import styles from './SobrietyCalendar.module.css';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

interface SobrietyCalendarProps {
    data: AdictionTrackingData[];
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

function getStartOffset(year: number, month: number): number {
    const firstDay = new Date(year, month, 1).getDay();
    return (firstDay + 6) % 7;
}

export function SobrietyCalendar({ data }: SobrietyCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const days = getDaysInMonth(year, month);
    const offset = getStartOffset(year, month);

    const urgesByDay = new Map<string, number>();
    const relapsesByDay = new Set<string>();

    const key = (d: Date) =>
        `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

    for (const addiction of data) {
        for (const urge of addiction.urges) {
            const d = new Date(urge);
            const k = key(d);
            urgesByDay.set(k, (urgesByDay.get(k) ?? 0) + 1);
        }
        for (const relapse of addiction.relapses) {
            const d = new Date(relapse);
            relapsesByDay.add(key(d));
        }
    }

    const today = new Date();

    return (
        <div className={styles.container}>
            <span className={styles.title}>Addiction Calendar</span>
            <div className={styles.header}>
                <button className={styles.arrow} onClick={prevMonth}>‹</button>
                <span className={styles.monthLabel}>
                    {MONTHS[month]} {year}
                </span>
                <button className={styles.arrow} onClick={nextMonth}>›</button>
            </div>

            <div className={styles.grid}>
                {DAY_LABELS.map(label => (
                    <div key={label} className={styles.dayLabel}>{label}</div>
                ))}

                {Array.from({ length: offset }).map((_, i) => (
                    <div key={`offset-${i}`} className={styles.empty} />
                ))}

                {days.map(day => {
                    const k = key(day);
                    const urgeCount = urgesByDay.get(k) ?? 0;
                    const hasRelapse = relapsesByDay.has(k);
                    const isToday = isSameDay(day, today);

                    return (
                        <div key={k} className={`${styles.day} ${hasRelapse ? styles.relapse : ''} ${isToday ? styles.today : ''}`}>
                            <span className={styles.dayNumber}>{day.getDate()}</span>
                            {urgeCount > 0 && (
                                <span className={styles.urgeBadge}>{urgeCount}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
