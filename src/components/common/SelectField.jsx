import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SelectField({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;

    function closeOnOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [open]);

  function openAt(index = selectedIndex) {
    setOpen(true);
    requestAnimationFrame(() => {
      const optionsList = rootRef.current?.querySelectorAll('[role="option"]');
      optionsList?.[Math.max(0, index)]?.focus();
    });
  }

  function handleTriggerKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openAt(event.key === 'ArrowDown' ? Math.max(selectedIndex, 0) : Math.max(selectedIndex, 0));
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  function handleOptionKeyDown(event, index) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      rootRef.current?.querySelectorAll('[role="option"]')[nextIndex]?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return <span className="select-field" ref={rootRef}>
    <button
      ref={triggerRef}
      className="select-field-trigger"
      type="button"
      aria-label={label}
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => open ? setOpen(false) : openAt()}
      onKeyDown={handleTriggerKeyDown}
    >
      <span>{selectedOption?.label || ''}</span>
      <ChevronDown size={15} aria-hidden="true" />
    </button>
    {open && <span className="select-field-menu" role="listbox" aria-label={label}>
      {options.map((option, index) => <button
        className="select-field-option"
        key={option.value}
        type="button"
        role="option"
        aria-selected={option.value === value}
        onClick={() => {
          onChange(option.value);
          setOpen(false);
          triggerRef.current?.focus();
        }}
        onKeyDown={(event) => handleOptionKeyDown(event, index)}
      >
        {option.label}
      </button>)}
    </span>}
  </span>;
}
