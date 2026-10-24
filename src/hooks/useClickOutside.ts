import { useEffect, type RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: MouseEvent) => {
      const element = ref.current;
      if (!element || element.contains(event.target as Node)) return;
      handler();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('keydown', escape);
    };
  }, [ref, handler, enabled]);
}
