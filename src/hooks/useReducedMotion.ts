import { useSyncExternalStore } from 'react';

export const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
export const normalMotionQuery = '(prefers-reduced-motion: no-preference)';

const preference = window.matchMedia(reducedMotionQuery);
const subscribe = (notify: () => void) => {
  preference.addEventListener('change', notify);
  return () => preference.removeEventListener('change', notify);
};

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => preference.matches);
}
