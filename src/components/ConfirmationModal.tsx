import ModalContainer from './ModalContainer';
import styles from './ConfirmationModal.module.css';
import { createPortal } from 'react-dom';

interface ConfirmationModalProps {
    title: string;
    message: React.ReactNode;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    zIndex?: number;
}

export function ConfirmationModal({ title, message, confirmLabel, onConfirm, onCancel, zIndex }: ConfirmationModalProps) {
    return createPortal(
    <ModalContainer onClose={onCancel} zIndex={zIndex}>
        <div className={styles.card}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.message}>{message}</p>
            <div className={styles.buttons}>
                <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
                <button className={styles.confirmButton} onClick={onConfirm}>{confirmLabel}</button>
            </div>
        </div>
    </ModalContainer>,
    document.body
);
}