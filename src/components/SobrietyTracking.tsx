import { useEffect, useState } from 'react';
import { fetchSobrietyTrackingData, type AdictionTrackingData } from '../lib/sobrietyTrackingService';
import { UrgeChart } from './UrgeChart';
import styles from './SobrietyTracking.module.css';
import { SobrietyCalendar } from './SobrietyCalendar';
import { StreakSection } from './StreakSection';

export function SobrietyTracking() {
    const [data, setData] = useState<AdictionTrackingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSobrietyTrackingData()
            .then(setData)
            .catch(() => setError('Failed to load tracking data.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className={styles.state}>Loading...</div>;
    if (error) return <div className={styles.state}>{error}</div>;
    if (data.length === 0) return (
        <div className={styles.state}>
            No addictions tracked yet. Add one in Manage Addictions.
        </div>
    );

    return (
    <div className={styles.container}>
        <UrgeChart data={data} />
        <SobrietyCalendar data={data} />
        <StreakSection data={data} />
    </div>
);
}