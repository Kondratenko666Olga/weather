'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './CityCard.module.scss';

const TempChart = ({ hourlyData }) => {
  if (!hourlyData || hourlyData.length === 0)
    return <p className={styles.chartError}>Немає даних для графіка.</p>;

  // 1. Визначаємо мін/макс температуру для масштабування графіка
  const temps = hourlyData.map((d) => d.temp);
  const minTemp = Math.floor(Math.min(...temps) - 1);
  const maxTemp = Math.ceil(Math.max(...temps) + 1);
  const tempRange = maxTemp - minTemp;

  return (
    <div className={styles.chartContainer}>
      <h4 className={styles.chartTitle}>Погодинний прогноз (24 год)</h4>
      <div className={styles.chartGrid}>
        {hourlyData.map((d, index) => {
          // 2. Обчислюємо висоту елемента як відсоток від діапазону температур
          const heightPercent = ((d.temp - minTemp) / tempRange) * 100;
          const time = new Date(d.time * 1000).getHours();
          const isCurrentHour = index === 0;

          return (
            <div key={d.time} className={styles.chartBarWrapper}>
              <div
                className={`${styles.chartBar} ${
                  isCurrentHour ? styles.currentHour : ''
                }`}
                style={{ height: `${heightPercent}%` }}
                title={`${time}:00: ${Math.round(d.temp)}°C`}
              ></div>
              <span className={styles.chartLabelTemp}>
                {Math.round(d.temp)}°C
              </span>
              <span className={styles.chartLabelTime}>{time}h</span>
            </div>
          );
        })}
      </div>
      <p className={styles.chartScale}>
        Шкала температур: {minTemp}°C до {maxTemp}°C
      </p>
    </div>
  );
};

const DetailedView = ({ data, onClose }) => {
  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [loadingHourly, setLoadingHourly] = useState(true);

  // Executing an additional request when opening a modal window
  useEffect(() => {
    const fetchHourly = async () => {
      if (!data.fullData.coord) {
        console.error('No coordinates available for hourly query.');
        setLoadingHourly(false);
        return;
      }

      try {
        const { lat, lon } = data.fullData.coord;
        const res = await fetch(`/api/hourly?lat=${lat}&lon=${lon}`);
        const forecastData = await res.json();

        if (res.ok) {
          setHourlyForecast(forecastData);
        } else {
          console.error('Hourly fetch failed:', forecastData.message);
        }
      } catch (error) {
        console.error('Error fetching hourly data:', error);
      } finally {
        setLoadingHourly(false);
      }
    };

    fetchHourly();
  }, [data.fullData.coord]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>
          {data.name} (Detailed weather forecast)
        </h3>
        <p className={styles.modalTempSummary}>
          🌡️ {data.fullData.main.temp}°C | {data.description}
        </p>
        <div className={styles.modalDetails}>
          <p>
            <strong>Feels like:</strong> {data.fullData.main.feels_like}°C
          </p>
          <p>
            <strong>Min. / Max. temp.:</strong> {data.fullData.main.temp_min}°C
            / {data.fullData.main.temp_max}°C
          </p>
          <p>
            <strong>Humidity:</strong> {data.fullData.main.humidity}%
          </p>
          <p>
            <strong>Pressure:</strong> {data.fullData.main.pressure} hPa
          </p>
          <p>
            <strong>Wind speed:</strong> {data.fullData.wind.speed} m/s
          </p>
        </div>
        <hr className={styles.modalSeparator} />
        <div className={styles.modalChartSection}>
          {loadingHourly && <p>Download hourly forecast...</p>}
          {!loadingHourly && <TempChart hourlyData={hourlyForecast} />}
        </div>
        <p className={styles.modalUpdatedTime}>Updated: {data.updatedAt}</p>
        <button onClick={onClose} className={styles.modalCloseButton}>
          Close
        </button>
      </div>
    </div>
  );
};

export function CityCard({ weather, onRefresh, onRemove }) {
  const [showDetail, setShowDetail] = useState(false);

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <>
      <div className={styles.card}>
        <div onClick={() => setShowDetail(true)} className={styles.cardInfo}>
          <div className={styles.header}>
            <h2 className={styles.title}>{weather.name}</h2>
            <Image
              src={iconUrl}
              alt={weather.description}
              className={styles.icon}
              width={64}
              height={64}
              priority
            />
          </div>
          <p className={styles.temp}>{Math.round(weather.temp)}°C</p>
          <p className={styles.description}>{weather.description}</p>
          <p className={styles.updateTime}>
            Latest update: {weather.updatedAt}
          </p>
        </div>

        <div className={styles.actions}>
          <button onClick={onRefresh} className={styles.refreshBtn}>
            🔄 Update now
          </button>
          <button onClick={onRemove} className={styles.removeBtn}>
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Use of the external component  */}
      {showDetail && (
        <DetailedView data={weather} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
