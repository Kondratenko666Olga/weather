'use client';

import { useState, useEffect } from 'react';
import styles from './CitySearch.module.scss';
import useDebounce from '../../hooks/useDebounce';

export function CitySearch({ onAddCity }) {
  const [cityInput, setCityInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Using the debounce hook to delay the request by 500 ms
  const debouncedCityInput = useDebounce(cityInput, 500);

  // Logic for receiving hints
  useEffect(() => {
    if (debouncedCityInput.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        // Calling the API Route for a list of cities
        const res = await fetch(`/api/geocode?q=${debouncedCityInput}&limit=5`);
        const data = await res.json();

        if (res.ok) {
          setSuggestions(data);
        } else {
          console.error('Failed to fetch suggestions:', data.message);
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Network error fetching suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedCityInput]);

  const handleSelectSuggestion = async (suggestionName) => {
    // Use the full name for adding
    setCityInput(suggestionName);
    setSuggestions([]); // Cleaning up the list of hints
    await onAddCity(suggestionName); // Add city
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedCity = cityInput.trim();
    if (!trimmedCity) return;

    setIsAdding(true);
    try {
      await onAddCity(trimmedCity);
    } finally {
      setIsAdding(false);
      setCityInput('');
      setSuggestions([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchForm}>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder="Enter the name of the city (minimum 3 characters)"
          className={styles.inputField}
          disabled={isAdding}
          autoComplete="off" // disabling browser autocomplete
        />

        {/* Drop-down list of hints */}
        {suggestions.length > 0 && (
          <ul className={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className={styles.suggestionItem}
                onClick={() => handleSelectSuggestion(suggestion.fullName)}
              >
                {suggestion.fullName}
              </li>
            ))}
          </ul>
        )}

        {loadingSuggestions && debouncedCityInput.length >= 3 && (
          <div className={styles.loadingSuggestions}>Loading hints...</div>
        )}
      </div>

      <button type="submit" className={styles.submitButton} disabled={isAdding}>
        {isAdding ? '⏳ Adding...' : '➕ Add a city'}
      </button>
    </form>
  );
}
