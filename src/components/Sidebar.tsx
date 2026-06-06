import GlassContainer from './GlassContainer';
import styles from './Sidebar.module.css';

import JournalIcon from '../assets/journal-icon.png';
import AddictionIcon from '../assets/addiction-icon.png';
import TrackingIcon from '../assets/tracking-icon.png';
import RescueIcon from '../assets/rescue-icon.png';

export type ModalID = 'journal' | 'sobriety-manage' | 'sobriety-track' | 'rescue-aid';

interface SidebarItem {
    id: string;
    label: string;
    modalId: ModalID;
}

const ICON_MAP: Record<string, string> = {
    'journal': JournalIcon,
    'manage-sobriety': AddictionIcon,
    'track-sobriety': TrackingIcon,
    'rescue-aid': RescueIcon
};

const sidebarItems: SidebarItem[] = [
    { id: 'journal', label: 'Journal Entry', modalId: 'journal' },
    { id: 'manage-sobriety', label: 'Manage Addictions', modalId: 'sobriety-manage' },
    { id: 'track-sobriety', label: 'Sobriety Tracking', modalId: 'sobriety-track' },
    { id: 'rescue-aid', label: 'Rescue Aid', modalId: 'rescue-aid' }
];

interface SidebarProps {
    onAction: (modalId: ModalID) => void;
    activeView: ModalID | null;
}

export default function Sidebar({ onAction, activeView }: SidebarProps) {
    return (
        <GlassContainer className={styles.container}>
            <div className={styles.sidebar}>
                <h3 className={styles.sidebarHeader}>Dashboard</h3>

                {sidebarItems.map((item) => (
                    <button
                        key={item.id}
                        className={`${styles.sidebarItem} ${activeView === item.modalId ? styles.active : ''}`}
                        onClick={() => onAction(item.modalId)}
                        type="button"
                    >
                        <img
                            src={ICON_MAP[item.id]}
                            alt=""
                            className={styles.sidebarIcon}
                            aria-hidden="true"
                        />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </GlassContainer>
    );
}