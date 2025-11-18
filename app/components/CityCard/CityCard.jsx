'use client';

import Image from 'next/image';
import { useState } from 'react';
import styles from './CityCard.module.scss';

const DetailedView = ({ data, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in">
      <h3 className="text-3xl font-bold mb-4 text-blue-700">
        {data.name} (Detailed weather forecast)
      </h3>
      <p className="text-xl mb-4">
        🌡️ {data.fullData.main.temp}°C | {data.description}
      </p>
      <div className="space-y-2 text-gray-700">
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
      <p className="mt-6 text-sm text-gray-500">Updated: {data.updatedAt}</p>
      <button
        onClick={onClose}
        className="mt-6 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
      >
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
