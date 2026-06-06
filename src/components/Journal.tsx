import { useState } from 'react';
import { saveJournalEntry } from '../lib/journalService';
import type { Addiction } from '../types/journal';
import styles from './Journal.module.css';

import { PulseSlider } from './PulseSlider';

const handleSave = async () => {
    try {
        const entryData = {
            daily_pulse: { mood, energy, affect, anxiety },
            content: journalText,
            addictions: currentAddictions,
        };

        await saveJournalEntry(entryData);
        alert("Entry saved successfully!");
    } catch (error) {
        console.error("Error saving entry:", error);
    }
};

export default function Journal() {
    const [mood, setMood] = useState<number | null>(null);
    const [energy, setEnergy] = useState<number | null>(null);
    const [affect, setAffect] = useState<number | null>(null);
    const [anxiety, setAnxiety] = useState<number | null>(null);
    const [journalText, setJournalText] = useState("");
    const [currentAddictions, setCurrentAddictions] = useState<Addiction[]>([]);

    const handleSave = async () => {
        try {
            const entryData = {
                daily_pulse: { mood, energy, affect, anxiety },
                content: journalText,
                addictions: currentAddictions,
            };

            await saveJournalEntry(entryData);
            alert("Entry saved successfully!");
        } catch (error) {
            console.error("Error saving entry:", error);
        }
    };

    return (
        <div className={styles.journalContainer}>
            <section className={styles.section}>
                <span className={styles.sectionHeader}>Daily Pulse</span>

                <div className={styles.subSectionInline}>
                    <span className={styles.subSectionHeader}>Mood</span>
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
                        <span className={styles.subSectionHeader}>Emotional Intensity</span>
                        <div className={styles.sliderControlContainer}>
                            <PulseSlider value={affect} onChange={setAffect} gradient="#ADD8E6, #8B0000" />
                            <span className={styles.valueDisplay}>{affect ? Math.round(affect) : "--"}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.subSection}>
                    <div className={styles.sliderRow}>
                        <span className={styles.subSectionHeader}>Energy Level</span>
                        <div className={styles.sliderControlContainer}>
                            <PulseSlider value={energy} onChange={setEnergy} gradient="#ffffff, #eee72c" />
                            <span className={styles.valueDisplay}>{energy ? Math.round(energy) : "--"}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.subSection}>
                    <div className={styles.sliderRow}>
                        <span className={styles.subSectionHeader}>Anxiety</span>
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
            </section>

            <button className={styles.saveButton} onClick={handleSave}>Archive Entry</button>
        </div>
    );
}