"use client";

import { useEffect, useRef, useState } from "react";

export default function ExpandableText({ text, className = "" }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || open) return undefined;

    const measure = () => {
      setOverflows(element.scrollHeight > element.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, open]);

  if (!text) return null;

  return (
    <div className="expandable">
      <p ref={ref} className={`free_text${open ? "" : " is-clamped"} ${className}`.trim()}>
        {text}
      </p>
      {open || overflows ? (
        <button type="button" className="text_toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? "Voir moins" : "Voir plus"}
        </button>
      ) : null}
    </div>
  );
}
