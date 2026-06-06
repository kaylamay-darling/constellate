import { useEffect } from 'react';
import GlassContainer from './GlassContainer';
import styles from './ModalContainer.module.css';

interface ModalContainerProps {
    children: React.ReactNode;
    onClose: () => void;
}

export default function ModalContainer({ children, onClose }: ModalContainerProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className={styles.overlay}>
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <GlassContainer className={styles.glassInterior}>
                    {children}
                </GlassContainer>
            </div>
        </div>
    );
}