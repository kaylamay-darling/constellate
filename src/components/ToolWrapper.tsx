import styles from './ToolWrapper.module.css';

interface ToolWrapperProps {
    label: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function ToolWrapper({ label, onClose, children } : ToolWrapperProps) {
    return (
        <div className={styles.toolContent}>
            <header className={styles.header}>
                <h3 className={styles.title}>{label}</h3>
                <button onClick={onClose} className={styles.closeBtn}>X</button>
            </header>
            <div className={styles.body}>
                {children}
            </div>
        </div>
    );
}