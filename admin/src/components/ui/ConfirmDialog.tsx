import { Modal } from "./Modal";
import styles from "./Modal.module.css";
import catalog from "./catalog.module.css";

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({ title, message, confirmLabel, pending, onConfirm, onCancel }: Props) => {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className={styles.body}>{message}</p>
      <div className={styles.actions}>
        <button type="button" className={catalog.secondary} onClick={onCancel} disabled={pending}>
          Cancel
        </button>
        <button type="button" className={catalog.danger} onClick={onConfirm} disabled={pending}>
          {pending ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
