import { NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const ONE_CALL_BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json(
      { message: 'Missing coordinates (lat/lon)' },
      { status: 400 }
    );
  }

  try {
    // Using One Call API.
    // exclude=minutely,daily,alerts — to get only hourly forecasts.
    const url = `${ONE_CALL_BASE_URL}?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&appid=${OPENWEATHER_API_KEY}&units=metric&lang=uk`;

    // Cache data for 30 minutes
    const response = await fetch(url, { next: { revalidate: 1800 } });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Hourly forecast error' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter the hourly forecast to take only the current day (24 hours)
    const hourlyForecast = data.hourly.slice(0, 24).map((hour) => ({
      time: hour.dt, // Unix timestamp
      temp: hour.temp,
    }));

    return NextResponse.json(hourlyForecast);
  } catch (error) {
    console.error('Hourly fetch error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
