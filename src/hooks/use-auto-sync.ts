'use client';

import { useEffect, useRef } from 'react';

export function useAutoSync(
  syncFn: () => Promise<void>,
  dependency: unknown,
  delayMs: number = 10000
) {
  const isDirtyRef = useRef(false);
  const syncFnRef = useRef(syncFn);

  useEffect(() => {
    syncFnRef.current = syncFn;
  }, [syncFn]);

  // Mark dirty when dependencies change
  useEffect(() => {
    isDirtyRef.current = true;
  }, [dependency]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isDirtyRef.current) {
        syncFnRef.current().finally(() => {
          isDirtyRef.current = false;
        });
      }
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [dependency, delayMs]);

  // Try to sync on unmount
  useEffect(() => {
    return () => {
      if (isDirtyRef.current) {
        // Sync before unmount.
        // We use navigator.sendBeacon if possible, but fetch keepalive is modern standard
        syncFnRef.current();
      }
    };
  }, []);
}
