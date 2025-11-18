import { NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cityName = searchParams.get('city');

  if (!cityName) {
    return NextResponse.json(
      { message: 'Enter the name of the city' },
      { status: 400 }
    );
  }

  try {
    const url = `${BASE_URL}?q=${cityName}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=uk`;

    // Setting up caching for API requests, 5 minutes
    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      const errorData = await response.json();
      // Handling OpenWeather errors
      return NextResponse.json(
        { message: errorData.message || 'City not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error receiving weather:', error);
    return NextResponse.json(
      { coord: data.coord },
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
