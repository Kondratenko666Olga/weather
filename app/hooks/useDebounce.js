import { useState, useEffect } from 'react';

/**
 * Hook for delaying value updates.
 * @param {any} value - The value to be delayed.
 * @param {number} delay - The delay time in milliseconds.
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update debouncedValue after a delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear function: cancels the previous timer if value changes before the delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Run the effect if value or delay changes

  return debouncedValue;
}
