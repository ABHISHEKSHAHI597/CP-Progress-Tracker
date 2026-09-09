import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * A dialog that sits over the page. On phones it rises from the bottom as a
 * sheet, which is where a thumb already is; from small screens up it centres.
 *
 * Motion here answers an action rather than decorating the page, so it stays.
 */
function Modal({ open, onClose, title, children }) {
  const panelRef = useRef(null);
  const openerRef = useRef(null);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      // Keep focus inside the dialog while it is the only thing on screen.
      const items = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!items?.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the panel itself rather than the close button, so a screen reader
    // reads the dialog before its controls.
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] cursor-default"
        style={{ animation: "overlay-in 180ms ease-out both" }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative w-full sm:w-auto sm:min-w-[380px] sm:max-w-[min(560px,calc(100vw-2rem))]
                   max-h-[88svh] overflow-y-auto overscroll-contain
                   bg-ink-2 border-t sm:border border-line
                   rounded-t-2xl sm:rounded-xl outline-none
                   shadow-[0_-8px_40px_rgb(0_0_0/0.5)] sm:shadow-[0_20px_60px_rgb(0_0_0/0.6)]"
        style={{ animation: "panel-in 220ms cubic-bezier(.2,.7,.2,1) both" }}
      >
        {/* A grab handle reads as "this can be dismissed" on a phone. */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center" aria-hidden="true">
          <span className="h-1 w-9 rounded-full bg-line" />
        </div>

        <div className="flex items-start justify-between gap-4 px-5 pt-4 sm:pt-5 pb-3">
          <h2 className="text-[16px] font-semibold leading-snug">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 -mt-1 p-2 rounded-md text-faint hover:text-paper transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-6 sm:pb-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
