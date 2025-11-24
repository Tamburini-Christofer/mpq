import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function SearchSortBar({ sortValue, onSortChange }) {
  const [open, setOpen] = useState(false);

  const handleChange = (value) => {
    onSortChange(value);
    setOpen(false);
  };

  return (
    <div className="sort-wrapper">

      <div className={`custom-select ${open ? "open" : ""}`}>
        <button
          className="select-display"
          onClick={() => setOpen(!open)}
        >
          <span>{getLabel(sortValue)}</span>
          <FiChevronDown className="select-arrow" />
        </button>

        {open && (
          <ul className="select-dropdown">
            {OPTIONS.map((opt) => (
              <li
                key={opt.value}
                className={`select-option ${
                  sortValue === opt.value ? "active" : ""
                }`}
                onClick={() => handleChange(opt.value)}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const OPTIONS = [
  { value: "recent", label: "Più Recenti" },
  { value: "discount-desc", label: "Sconto (Maggiore)" },
  { value: "price-asc", label: "Prezzo (Crescente)" },
  { value: "price-desc", label: "Prezzo (Decrescente)" },
  { value: "name-asc", label: "Nome (A-Z)" },
  { value: "name-desc", label: "Nome (Z-A)" },
  { value: "rating-asc", label: "Valutazione (Bassa → Alta)" },
  { value: "rating-desc", label: "Valutazione (Alta → Bassa)" }
];

function getLabel(value) {
  const opt = OPTIONS.find((o) => o.value === value);
  return opt ? opt.label : "";
}
