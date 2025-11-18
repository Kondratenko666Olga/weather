'use client';

import { useState } from 'react';
import styles from './CitySearch.module.scss'; // ⬅️ Імпорт стилів

export function CitySearch({ onAddCity }) {
  const [cityInput, setCityInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

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
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchForm}>
      <input
        type="text"
        value={cityInput}
        onChange={(e) => setCityInput(e.target.value)}
        placeholder="Enter the name of the city"
        className={styles.inputField}
        disabled={isAdding}
      />
      <button type="submit" className={styles.submitButton} disabled={isAdding}>
        {isAdding ? '⏳ Adding...' : '➕ Add a city'}
      </button>
    </form>
  );
}
