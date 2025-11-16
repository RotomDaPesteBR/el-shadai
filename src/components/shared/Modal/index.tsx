import React from 'react';
import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  onCancel?: () => void;
  isConfirmDisabled?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmText,
  onConfirm,
  cancelText,
  onCancel,
  isConfirmDisabled = false,
}: ModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modal_overlay} onClick={handleOverlayClick}>
      <div className={styles.modal_content}>
        <div className={styles.modal_header}>
          <h3>{title}</h3>
          <button className={styles.close_button} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modal_body}>{children}</div>
        <div className={styles.modal_footer}>
          {onCancel && (
            <button className={styles.cancel_button} onClick={onCancel}>
              {cancelText || 'Cancelar'}
            </button>
          )}
          {onConfirm && (
            <button
              className={styles.confirm_button}
              onClick={onConfirm}
              disabled={isConfirmDisabled}
            >
              {confirmText || 'Confirmar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
