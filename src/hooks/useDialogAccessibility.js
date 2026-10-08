import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export default function useDialogAccessibility({ isOpen, isActive = true, onClose }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const hasReceivedInitialFocus = useRef(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    return () => {
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      hasReceivedInitialFocus.current = false;
      return undefined;
    }
    if (!isActive) return undefined;

    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const getFocusableElements = () => Array.from(
      dialog.querySelectorAll(FOCUSABLE_SELECTOR)
    ).filter((element) => element.getClientRects().length > 0);

    if (!hasReceivedInitialFocus.current) {
      const focusableElements = getFocusableElements();
      const initialFocus = dialog.querySelector('[data-autofocus]');
      (initialFocus ?? focusableElements[0] ?? dialog).focus();
      hasReceivedInitialFocus.current = true;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const currentFocusableElements = getFocusableElements();
      if (currentFocusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = currentFocusableElements[0];
      const lastElement = currentFocusableElements[currentFocusableElements.length - 1];
      const focusIsOutsideDialog = !dialog.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === firstElement || focusIsOutsideDialog)) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && (document.activeElement === lastElement || focusIsOutsideDialog)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isActive]);

  return dialogRef;
}
