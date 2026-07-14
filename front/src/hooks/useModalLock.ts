"use client";

import { useEffect, useRef } from "react";

type ModalKeyHandlers = {
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
};

export function useModalLock(open: boolean, handlers: ModalKeyHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      const h = handlersRef.current;
      if (event.key === "Escape") h.onClose();
      if (event.key === "ArrowRight") h.onNext();
      if (event.key === "ArrowLeft") h.onPrev();
      if (event.key === " ") {
        event.preventDefault();
        h.onTogglePlay();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
}
