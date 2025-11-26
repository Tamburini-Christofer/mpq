import React, { useState, useRef, useEffect } from 'react';
import '../../styles/components/CustomSelect.css';

export default function CustomSelect({
  id,
  value,
  options = [],
  onChange,
  ariaLabel,
  placeholder
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleToggle = () => setOpen((v) => !v);

  const handleSelect = (opt) => {
    if (onChange) onChange(opt);
    setOpen(false);
    // return focus to button for accessibility
    setTimeout(() => buttonRef.current && buttonRef.current.focus(), 0);
  };

  return (
    <div className="custom-select-wrapper" ref={ref} id={id}>
      <button
        ref={buttonRef}
        type="button"
        className="custom-select-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={handleToggle}
      >
        <span className="custom-select-value">{value ?? placeholder}</span>
        <span className="custom-select-arrow">▾</span>
      </button>

      {open && (
        <ul className="custom-select-list" role="listbox" tabIndex={-1}>
          {options.map((opt) => (
            <li
              key={String(opt)}
              role="option"
              aria-selected={opt === value}
              className={`custom-select-option ${opt === value ? 'active' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
