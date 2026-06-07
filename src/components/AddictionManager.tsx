import { useState } from 'react';
import styles from './AddictionManager.module.css';
import { useAddiction } from '../context/AddictionContext';
import TrashIcon from '../assets/trash-icon.png';
import { ADDICTIONS_LIST } from '../constants/addictions';

function getLatestReferenceDate(addiction: { relapses: string[]; startDate: string }) {
    if (!addiction.relapses.length) return addiction.startDate;
    return addiction.relapses.reduce((latest, current) =>
        new Date(current) > new Date(latest) ? current : latest, addiction.relapses[0]);
}

function getDaysSince(dateString: string) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 0;
    const diffMs = Date.now() - date.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getSoberDuration(dateString: string) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '0 minutes';
    const diffMs = Math.max(0, Date.now() - date.getTime());
    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'}`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? '' : 's'}`;
}

export function AddictionManager() {
    const { addictions, addAddiction, removeAddiction, updateStartDate, logEvent } = useAddiction();
    const [isOpen, setIsOpen] = useState(false);
    const [addictionToDelete, setAddictionToDelete] = useState<string | null>(null);
    const [customInput, setCustomInput] = useState('');

    const handleSelectAddiction = (name: string) => {
        addAddiction(name);
        setIsOpen(false);
    };

    const handleAddCustom = () => {
        const trimmed = customInput.trim();
        if (!trimmed) return;
        addAddiction(trimmed);
        setCustomInput('');
        setIsOpen(false);
    };

    return (
        <>
            <div className={styles.addictionWrapper}>
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>Current Addictions</div>
                    {addictions.map((a) => {
                        const referenceDate = getLatestReferenceDate(a);
                        const daysSince = getDaysSince(referenceDate);
                        const soberDuration = getSoberDuration(referenceDate);
                        const progress = Math.min(100, Math.round((Math.min(daysSince, 30) / 30) * 100));

                        return (
                            <div key={a.name} className={styles.listItem}>
                                <div className={styles.listItemRow}>
                                    <div className={styles.addictionHeader}>
                                        <div className={styles.radialProgress} style={{
                                            background: `radial-gradient(closest-side, var(--background-surface) 78%, transparent 80% 100%), conic-gradient(var(--cta-text) ${progress}%, var(--glassmorphism-shadow) 0)`
                                        }}>
                                            <span className={styles.progressValue}>{`${Math.min(daysSince, 30)} / 30`}</span>
                                        </div>
                                        <div className={styles.addictionTextStack}>
                                            <span className={styles.addictionTitle}>{a.name}</span>
                                            <div className={styles.soberFor}>Sober for: {soberDuration}</div>
                                        </div>
                                    </div>
                                    <img src={TrashIcon} className={styles.trashIcon} onClick={(e) => { e.stopPropagation(); setAddictionToDelete(a.name); }} />
                                </div>

                                <div className={styles.dateContainer}>
                                    <label className={styles.dateLabel}>Started:</label>
                                    <input
                                        type="date"
                                        className={styles.dateInput}
                                        value={a.startDate ? new Date(a.startDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => {
                                            const newDate = e.target.value;
                                            if (newDate) updateStartDate(a.name, newDate);
                                        }}
                                    />
                                </div>

                                <div className={styles.actionRow}>
                                    <button className={styles.logUrgeBtn} onClick={() => logEvent(a.name, 'urge')}>LOG URGE</button>
                                    <button className={styles.logRelapseBtn} onClick={() => logEvent(a.name, 'relapse')}>LOG RELAPSE</button>
                                </div>
                            </div>
                        );
                    })}
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
                                    {ADDICTIONS_LIST.map(name => (
                                        <div key={name} className={styles.listItem} onClick={() => handleSelectAddiction(name)}>{name}</div>
                                    ))}
                                    <div className={styles.customInputRow}>
                                        <input
                                            className={styles.customInput}
                                            placeholder="Custom addiction..."
                                            value={customInput}
                                            onChange={e => setCustomInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                                        />
                                        <button className={styles.customAddBtn} onClick={handleAddCustom}>Add</button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={styles.buttonHeader}><span>+ Add Addiction</span></div>
                        )}
                    </button>
                </div>
            </div>

            {addictionToDelete && (
                <div className={styles.modalOverlay} onClick={() => setAddictionToDelete(null)}>
                    <div className={styles.confirmationModal} onClick={(e) => e.stopPropagation()}>
                        <h3>Remove Addiction?</h3>
                        <p>Are you sure you want to remove <strong>{addictionToDelete}</strong>?</p>
                        <div className={styles.modalButtons}>
                            <button className={styles.cancelButton} onClick={() => setAddictionToDelete(null)}>Cancel</button>
                            <button className={styles.confirmButton} onClick={() => { removeAddiction(addictionToDelete); setAddictionToDelete(null); }}>Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}