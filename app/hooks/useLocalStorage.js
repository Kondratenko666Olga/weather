import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    // Loading values from LocalStorage on first render
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage key “' + key + '”:', error);
      return initialValue;
    }
  });

  // Saving values in LocalStorage with every state change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(
          'Error writing to localStorage key “' + key + '”:',
          error
        );
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
