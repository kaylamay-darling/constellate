import styles from './Journal.module.css';

export default function Journal() {
    return (
        <div className={styles.journalContainer}>

            <section className={styles.section}>
                <span className={styles.sectionHeader}>Daily Pulse</span>
            </section>

            <section className={styles.section}>
                <span className={styles.sectionHeader}>Journal Entry</span>
                <textarea
                    placeholder="What's on your mind today..."
                    className={styles.textarea}
                />
            </section>

            <section className={styles.section}>
                <span className={styles.sectionHeader}>Addictions</span>
            </section>

            <button className={styles.saveButton}>Archive Entry</button>
        </div>
    );
}