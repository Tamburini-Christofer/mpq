import React, { useEffect } from 'react';
import '../../styles/components/Toast.css';

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  useEffect(() => {
    const t = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      <div className="toast__icon">{icons[type] || icons.info}</div>
      <div className="toast__body">
        <div className="toast__message">{message}</div>
      </div>
      <button className="toast__close" onClick={() => onClose && onClose()} aria-label="Chiudi">✕</button>
    </div>
  );
}
