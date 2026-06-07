import styles from './ToggleSwitch.module.css';

interface ToggleSwitchProps {
    label: string;
    checked: boolean;
    onChange: () => void;
    variant?: 'urge' | 'relapse';
}

export function ToggleSwitch({ label, checked, onChange, variant = 'urge' }: ToggleSwitchProps) {
    return (
        <div
            className={styles.wrapper}
            onClick={onChange}
            tabIndex={0}
            role="switch"
            aria-checked={checked}
            onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onChange();
                }
            }}
        >
            <span className={styles.label}>{label}</span>
            <div className={`${styles.track} ${checked ? styles.trackActive : ''} ${checked && variant === 'relapse' ? styles.trackRelapse : ''}`}>
                <div className={`${styles.thumb} ${checked ? styles.thumbActive : ''} ${checked && variant === 'relapse' ? styles.thumbRelapse : ''}`} />
            </div>
        </div>
    );
}