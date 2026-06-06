import { useState } from 'react';
import styles from './AddictionManager.module.css';
import type { Addiction } from '../types/journal';

const COMMON_ADDICTIONS = [
    "Alcohol",
    "Nicotine",
    "Self-harm",
    "Dextromethorphan",
    "Benadryl",
    "Caffeine",
    "Sugar"
];

export function AddictionManager() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.addictionWrapper}>
            <div className={styles.section}>
                <div className={styles.sectionHeader}>Current Addictions</div>
            </div>

            <div className={styles.addArea}>
                <button className={`${styles.addButton} ${isOpen ? styles.open : ''}`} onClick={() => !isOpen && setIsOpen(true)}>
                    {isOpen ? (
                        <>
                            <div className={styles.buttonHeader}>
                                <span>+ Add Addiction</span>
                                <span className={styles.closeX} onClick={e => { e.stopPropagation(); setIsOpen(false); }}>✕</span>
                            </div>
                            <div className={styles.list} onClick={e => e.stopPropagation()}>
                                {COMMON_ADDICTIONS.map(name => (
                                    <div key={name} className={styles.listItem}>{name}</div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className={styles.buttonHeader}>
                            <span>+ Add Addiction</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}