'use client';

import Image from 'next/image';
import { useState } from 'react';
import styles from './CityCard.module.scss';

const DetailedView = ({ data, onClose }) => (
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
          <strong>Min. / Max. temp.:</strong> {data.fullData.main.temp_min}°C /{' '}
          {data.fullData.main.temp_max}°C
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
      <p className={styles.modalUpdatedTime}>Updated: {data.updatedAt}</p>
      <button onClick={onClose} className={styles.modalCloseButton}>
        Close
      </button>
    </div>
  </div>
);

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
