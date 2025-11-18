import { NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const GEOCODING_BASE_URL = 'http://api.openweathermap.org/geo/1.0/direct';

/**
 * Searches for a list of cities based on the text entered (q)
 * @param {string} q - The text for searching (city name)
 * @param {number} limit - Maximum number of results (5 recommended)
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || 5;

  if (!query || query.length < 3) {
    return NextResponse.json([], { status: 200 }); // Return an empty list for short queries
  }

  try {
    const url = `${GEOCODING_BASE_URL}?q=${query}&limit=${limit}&appid=${OPENWEATHER_API_KEY}`;

    // Set up short caching, as search data can be dynamic
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Geocoding Error' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Formatting the result for the customer
    const formattedData = data.map((city) => ({
      name: city.name,
      state: city.state,
      country: city.country,
      // Full name to display
      fullName: `${city.name}${city.state ? ', ' + city.state : ''}, ${
        city.country
      }`,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Geocoding fetch error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
