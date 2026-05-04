'use client';

import { useState, useEffect } from 'react';
import localforage from 'localforage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load from localForage on mount
    localforage.getItem<T>(key).then((value) => {
      if (value !== null) {
        setStoredValue(value);
      }
      setIsReady(true);
    });
  }, [key]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await localforage.setItem(key, valueToStore);
    } catch (error) {
      console.error('Error saving to localforage', error);
    }
  };

  return [storedValue, setValue, isReady] as const;
}
