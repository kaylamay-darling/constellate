import GlassContainer from './GlassContainer';
import styles from './Sidebar.module.css';

type NavAction =
    | { type: 'MODAL'; modalId: 'journal' | 'sobriety-manage' | 'sobriety-track' | 'rescue-aid' }
    | { type: 'LINK'; path: string };

interface SidebarItem {
    id: string;
    label: string;
    action: NavAction;
}

const sidebarItems: SidebarItem[] = [
    { id: 'journal', label: 'Journal Entry', action: { type: 'MODAL', modalId: 'journal' } },
    { id: 'manage-sobriety', label: 'Manage Sobriety', action: { type: 'MODAL', modalId: 'sobriety-manage' } },
    { id: 'track-sobriety', label: 'Sobriety Tracking', action: { type: 'MODAL', modalId: 'sobriety-track' } },
    { id: 'rescue-aid', label: 'Rescue Aid', action: { type: 'MODAL', modalId: 'rescue-aid' } }
];

interface SidebarProps {
    onAction: (action: NavAction) => void;
}

export default function Sidebar({ onAction }: SidebarProps) {
    return (
        <nav className={styles.sidebar}>
            <GlassContainer className={styles.sidebarContainer}>
                <span className={styles.sidebarTitle}>Dashboard</span>

                {sidebarItems.map((item) => (
                    <button
                        key={item.id}
                        className={styles.glassCard}
                        onClick={() => onAction(item.action)}
                        type="button"
                    >
                        <span className={styles.icon}>✧</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </GlassContainer>
        </nav>
    );
}