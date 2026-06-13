import { useState } from 'react';
import { saveJournalEntry } from '../lib/journalService';
import styles from './Journal.module.css';
import { PulseSlider } from './PulseSlider';
import { useAddiction } from '../context/AddictionContext';
import { ToggleSwitch } from './ToggleSwitch';

interface JournalProps {
    onClose: () => void;
    onEntrySaved?: () => void;
}


export default function Journal({ onClose, onEntrySaved }: JournalProps) {
    const [mood, setMood] = useState<number | null>(null);
    const [energy, setEnergy] = useState<number | null>(null);
    const [affect, setAffect] = useState<number | null>(null);
    const [anxiety, setAnxiety] = useState<number | null>(null);
    const [journalText, setJournalText] = useState("");
    const [journalEvents, setJournalEvents] = useState<Record<string, { urge: boolean; relapse: boolean }>>({});

    const { addictions, logEvent } = useAddiction();

    const isValid = mood !== null && energy !== null && affect !== null && anxiety !== null && journalText.trim() !== '';

    const toggleEvent = (name: string, type: 'urge' | 'relapse') => {
        setJournalEvents(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                [type]: !prev[name]?.[type],
            }
        }));
    };

    const handleSave = async () => {
        if (
            mood === null ||
            energy === null ||
            affect === null ||
            anxiety === null ||
            journalText.trim() === ''
        ) return;

        try {
            const entryData = {
                daily_pulse: { mood, energy, affect, anxiety },
                content: journalText,
                addictions: journalEvents,
            };

            await saveJournalEntry(entryData);
            onEntrySaved?.();
            onClose();

            for (const [name, events] of Object.entries(journalEvents)) {
                if (events.urge) await logEvent(name, 'urge');
                if (events.relapse) await logEvent(name, 'relapse');
            }

            onClose();
        } catch (error) {
            console.error("Error saving entry:", error);
        }
    };

    return (
        <>
            <div className={styles.journalContainer}>
                <section className={styles.section}>
                    <span className={styles.sectionHeader}>Daily Pulse</span>

                    <div className={styles.subSectionInline}>
                        <span className={styles.subSectionHeader}
                            title="How are you feeling right now?">Mood</span>
                        <div className={styles.moodPicker}>
                            <div className={`${styles.moodItem} ${mood === 1 ? styles.active : ''}`} onClick={() => setMood(1)}>😢</div>
                            <div className={`${styles.moodItem} ${mood === 2 ? styles.active : ''}`} onClick={() => setMood(2)}>🙁</div>
                            <div className={`${styles.moodItem} ${mood === 3 ? styles.active : ''}`} onClick={() => setMood(3)}>😐</div>
                            <div className={`${styles.moodItem} ${mood === 4 ? styles.active : ''}`} onClick={() => setMood(4)}>🙂</div>
                            <div className={`${styles.moodItem} ${mood === 5 ? styles.active : ''}`} onClick={() => setMood(5)}>😊</div>
                        </div>
                    </div>

                    <div className={styles.subSection}>
                        <div className={styles.sliderRow}>
                            <span className={styles.subSectionHeader}
                                title="How overwhelming do your emotions feel?">Emotional Intensity</span>
                            <div className={styles.sliderControlContainer}>
                                <PulseSlider value={affect} onChange={setAffect} gradient="#ADD8E6, #8B0000" />
                                <span className={styles.valueDisplay}>{affect ? Math.round(affect) : "--"}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.subSection}>
                        <div className={styles.sliderRow}>
                            <span className={styles.subSectionHeader}
                                title="How motivated or energized do you feel?">Energy Level</span>
                            <div className={styles.sliderControlContainer}>
                                <PulseSlider value={energy} onChange={setEnergy} gradient="#ffffff, #eee72c" />
                                <span className={styles.valueDisplay}>{energy ? Math.round(energy) : "--"}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.subSection}>
                        <div className={styles.sliderRow}>
                            <span className={styles.subSectionHeader}
                                title="How loud are your thoughts, or how oppressing is your panic?">Anxiety</span>
                            <div className={styles.sliderControlContainer}>
                                <PulseSlider value={anxiety} onChange={setAnxiety} gradient="#5baf58, #ab763e" />
                                <span className={styles.valueDisplay}>{anxiety ? Math.round(anxiety) : "--"}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <span className={styles.sectionHeader}>Journal Entry</span>
                        <textarea
                            placeholder="What's on your mind today..."
                            className={styles.textarea}
                            value={journalText}
                            onChange={(e) => setJournalText(e.target.value)}
                        />
                </section>

                <section className={styles.section}>
                    <span className={styles.sectionHeader}>Addictions</span>
                    {addictions.map(a => (
                        <div key={a.name} className={styles.addictionRow}>
                            <span className={styles.addictionName}>{a.name}</span>
                            <div className={styles.toggleGroup}>
                                <ToggleSwitch
                                    label="Urge"
                                    checked={journalEvents[a.name]?.urge ?? false}
                                    onChange={() => toggleEvent(a.name, 'urge')}
                                    variant="relapse"
                                />
                                <ToggleSwitch
                                    label="Relapse"
                                    checked={journalEvents[a.name]?.relapse ?? false}
                                    onChange={() => toggleEvent(a.name, 'relapse')}
                                    variant="relapse"
                                />
                            </div>
                        </div>
                    ))}
                </section>

                <button className={styles.saveButton} onClick={handleSave} disabled={!isValid}>Archive Entry</button>
            </div>
        </>
    );
}