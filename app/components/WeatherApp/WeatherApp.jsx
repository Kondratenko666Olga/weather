// components/WeatherApp.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CityCard } from '../CityCard/CityCard';
import { CitySearch } from '../CitySearch/CitySearch';
import styles from './WeatherApp.module.scss';

// Допоміжна функція для запиту через ваш Next.js API Route
async function fetchWeather(cityName) {
  const res = await fetch(`/api/weather?city=${cityName}`);
  const data = await res.json();

  if (res.ok) {
    return {
      name: data.name,
      temp: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      updatedAt: new Date().toLocaleTimeString('uk-UA'),
      fullData: data,
    };
  } else {
    throw new Error(
      data.message || `Не вдалося отримати погоду для ${cityName}`
    );
  }
}

export function WeatherApp() {
  const [cityNames, setCityNames] = useLocalStorage('weatherCities', [
    'Kyiv',
    'Lviv',
  ]);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(cityNames.length > 0);

  // 1. Логіка оновлення всіх міст (винесена для чистого виклику)
  const updateAllWeather = useCallback(async (names) => {
    const promises = names.map((name) =>
      fetchWeather(name).catch((error) => {
        console.error(`Помилка оновлення ${name}:`, error.message);
        return { name, error: error.message };
      })
    );
    const results = await Promise.all(promises);
    return results.filter((r) => !r.error);
  }, []);

  // 2. Ініціалізація/Оновлення при зміні cityNames (ВЕЛИКЕ ВИПРАВЛЕННЯ: прибрано updateAllWeather з залежностей)
  useEffect(() => {
    let cancelled = false;
    const cleanup = () => {
      cancelled = true;
    };

    if (cityNames.length === 0) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setWeatherData([]);
          setLoading(false);
        }
      });
      return cleanup;
    }

    Promise.resolve().then(() => {
      if (!cancelled) {
        setLoading(true);
      }
    });

    updateAllWeather(cityNames)
      .then((data) => {
        if (!cancelled) {
          setWeatherData(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Помилка масового оновлення:', error);
          setLoading(false);
        }
      });

    return cleanup;
  }, [cityNames, updateAllWeather]); // ⬅️ Тут cityNames та updateAllWeather

  // 3. Логіка додавання міста
  const addCity = useCallback(
    async (cityName) => {
      const normalizedCityName = cityName.trim().split(',')[0].toLowerCase();

      if (cityNames.map((c) => c.toLowerCase()).includes(normalizedCityName)) {
        alert('Місто вже додано!');
        return;
      }

      try {
        const newWeather = await fetchWeather(cityName);
        setCityNames((prev) => [...prev, newWeather.name]);
        setWeatherData((prev) => [...prev, newWeather]);
      } catch (error) {
        alert(`Помилка додавання міста: ${error.message}`);
      }
    },
    [cityNames, setCityNames]
  );

  // 4. Логіка видалення міста
  const removeCity = useCallback(
    (cityName) => {
      setCityNames((prev) => prev.filter((name) => name !== cityName));
      setWeatherData((prev) => prev.filter((data) => data.name !== cityName));
    },
    [setCityNames]
  );

  // 5. Логіка оновлення одного міста
  const refreshCity = useCallback(async (cityName) => {
    try {
      const updatedWeather = await fetchWeather(cityName);
      setWeatherData((prev) =>
        prev.map((data) => (data.name === cityName ? updatedWeather : data))
      );
    } catch (error) {
      alert(`Помилка оновлення ${cityName}: ${error.message}`);
    }
  }, []);

  if (loading && cityNames.length > 0) {
    return (
      <div className={styles.loading}>Завантаження та оновлення даних...</div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className={styles.headerTitle}>🌤️ Your city weather</h1>

      <CitySearch onAddCity={addCity} />

      <hr className="my-8" />

      <div className={styles.cardGrid}>
        {weatherData.length === 0 && !loading && (
          <p className={styles.emptyListMessage}>
            Список міст порожній. Додайте місто, щоб розпочати.
          </p>
        )}
        {weatherData.map((weather) => (
          <CityCard
            key={weather.name}
            weather={weather}
            onRefresh={() => refreshCity(weather.name)}
            onRemove={() => removeCity(weather.name)}
          />
        ))}
      </div>
    </div>
  );
}
