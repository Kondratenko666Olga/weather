import { render, screen, waitFor, act } from '@testing-library/react';
import { useLayoutEffect } from 'react';

import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import { WeatherApp } from '@/app/components/WeatherApp/WeatherApp';

// --- MOCKS FOR CHILD COMPONENTS ---

// 1. Holder/Callback for CitySearch (for onAddCity)
const citySearchCallbackHolder = jest.fn();

// 2. Mock component CitySearch
jest.mock('@/app/components/CitySearch/CitySearch', () => {
  const MockCitySearch = (props) => {
    // Set up holder to call the real onAddCity function
    citySearchCallbackHolder.mockImplementation((...args) =>
      props.onAddCity(...args)
    );
    return <div data-testid="city-search-mock" />;
  };
  return { CitySearch: MockCitySearch };
});

// 3. Holder/Callback for CityCard (for onRemove and onRefresh)
// This will be an object where we store props of each rendered CityCard
let cityCardProps = {};

// 4. Mock component CityCard
jest.mock('@/app/components/CityCard/CityCard', () => {
  const MockCityCard = (props) => {
    // Store props of each CityCard using city name as key
    // Use useLayoutEffect to avoid modifying variable during render
    // useLayoutEffect runs synchronously after render, which is important for tests
    useLayoutEffect(() => {
      cityCardProps[props.weather.name] = props;
    }, [props]);

    // Return DOM element with test ID and key data
    return (
      <div data-testid={`city-card-mock-${props.weather.name}`}>
        <p>{props.weather.name}</p>
        <p>{Math.round(props.weather.temp)}°C</p>
      </div>
    );
  };
  return { CityCard: MockCityCard };
});

// --- MOCKS FOR HOOKS AND GLOBALS ---

jest.mock('@/app/hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn(),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockAlert = jest.fn();
global.alert = mockAlert;

// --- SETUP DATA AND FUNCTIONS ---

const initialCities = ['Kyiv', 'Lviv'];

// Create mock response in OpenWeather API format
const mockOpenWeatherResponse = (name, temp, description) => ({
  name,
  main: {
    temp,
    feels_like: temp - 2,
    temp_min: temp - 5,
    temp_max: temp + 5,
    pressure: 1013,
    humidity: 60,
  },
  weather: [
    {
      description,
      icon: '01d',
    },
  ],
  wind: {
    speed: 5,
  },
  coord: {
    lat: 50.45,
    lon: 30.52,
  },
});

const mockSuccessResponse = (name, temp, description) => ({
  ok: true,
  json: async () => mockOpenWeatherResponse(name, temp, description),
});

const setupMocks = (data = initialCities) => {
  // Variable to track setCities calls
  const mockSetCities = jest.fn();
  useLocalStorage.mockReturnValue([data, mockSetCities]);

  mockFetch.mockClear();
  mockAlert.mockClear();
  citySearchCallbackHolder.mockClear();
  cityCardProps = {}; // Clear CityCard props before each test

  // Setup initial API responses
  mockFetch
    .mockResolvedValueOnce(mockSuccessResponse('Kyiv', 10, 'cloudy'))
    .mockResolvedValueOnce(mockSuccessResponse('Lviv', 8, 'rainy'));

  return { mockSetCities }; // Return mockSetCities for use in tests
};

describe('WeatherApp', () => {
  let mockSetCities;

  beforeEach(() => {
    ({ mockSetCities } = setupMocks());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- BASIC RENDERING TESTS ---

  it('should render the loading state initially', () => {
    render(<WeatherApp />);
    expect(
      screen.getByText(/Data loading and updating.../i)
    ).toBeInTheDocument();
  });

  it('should render the header and CitySearch mock', async () => {
    render(<WeatherApp />);

    await waitFor(() => {
      expect(screen.getByText(/🌤️ Your city weather/i)).toBeInTheDocument();
      expect(screen.getByTestId('city-search-mock')).toBeInTheDocument();
    });
  });

  it('should render cards for initial cities after loading', async () => {
    render(<WeatherApp />);

    await waitFor(() => {
      expect(
        screen.queryByText(/Data loading and updating.../i)
      ).not.toBeInTheDocument();
    });

    // Check rendering based on mock CityCard component data
    expect(screen.getByText('Kyiv')).toBeInTheDocument();
    expect(screen.getByText('10°C')).toBeInTheDocument();
    expect(screen.getByText('Lviv')).toBeInTheDocument();
    expect(screen.getByText('8°C')).toBeInTheDocument();
  });

  // --- FUNCTIONALITY TESTS (REMOVAL, REFRESH, ADDING) ---

  it('should handle city removal', async () => {
    render(<WeatherApp />);

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(cityCardProps['Kyiv']).toBeDefined();
    });

    // Call onRemove through intercepted props
    await act(async () => {
      cityCardProps['Kyiv'].onRemove();
    });

    // Verify that setCities was called with updater function
    expect(mockSetCities).toHaveBeenCalled();
    const lastCall =
      mockSetCities.mock.calls[mockSetCities.mock.calls.length - 1];
    expect(typeof lastCall[0]).toBe('function');
    expect(lastCall[0](['Kyiv', 'Lviv'])).toEqual(['Lviv']);
  });

  it('should handle city refresh', async () => {
    render(<WeatherApp />);

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(cityCardProps['Kyiv']).toBeDefined();
    });

    // Setup mock for Kyiv update
    mockFetch.mockResolvedValueOnce(mockSuccessResponse('Kyiv', 15, 'sunny'));

    // Call onRefresh through intercepted props
    await act(async () => {
      await cityCardProps['Kyiv'].onRefresh();
    });

    // Verify that fetch was called 3 times (2 initial + 1 refresh)
    expect(mockFetch).toHaveBeenCalledTimes(3);

    // Verify that data was updated (Kyiv was updated to 15°C)
    await waitFor(() => {
      expect(screen.queryByText('10°C')).not.toBeInTheDocument();
      expect(screen.getByText('15°C')).toBeInTheDocument();
    });
  });

  it('should add a new city successfully', async () => {
    render(<WeatherApp />);

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(
        screen.queryByText(/Data loading and updating.../i)
      ).not.toBeInTheDocument();
    });

    // Setup mock for adding new city (Odesa)
    mockFetch.mockResolvedValueOnce(mockSuccessResponse('Odesa', 20, 'sunny'));

    await act(async () => {
      await citySearchCallbackHolder('Odesa');
    });

    expect(mockFetch).toHaveBeenCalledTimes(3); // 2 initial + 1 new
    // Verify that setCities was called with updater function
    expect(mockSetCities).toHaveBeenCalled();
    const lastCall =
      mockSetCities.mock.calls[mockSetCities.mock.calls.length - 1];
    expect(typeof lastCall[0]).toBe('function');
    expect(lastCall[0](['Kyiv', 'Lviv'])).toEqual(['Kyiv', 'Lviv', 'Odesa']);
  });

  it('should handle API error when adding a new city and show alert', async () => {
    render(<WeatherApp />);

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(
        screen.queryByText(/Data loading and updating.../i)
      ).not.toBeInTheDocument();
    });

    // Setup mock for error - API returns error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Could not find weather data for UnknownCity',
      }),
    });

    await act(async () => {
      await citySearchCallbackHolder('UnknownCity');
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('City adding error')
      );
    });
    // Verify that setCities was NOT called
    expect(mockSetCities).not.toHaveBeenCalledWith(
      expect.arrayContaining(['UnknownCity'])
    );
  });

  it('should alert if the city is already added (case-insensitive check)', async () => {
    render(<WeatherApp />);

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(
        screen.queryByText(/Data loading and updating.../i)
      ).not.toBeInTheDocument();
    });

    await act(async () => {
      await citySearchCallbackHolder('kYiv');
    });

    expect(mockAlert).toHaveBeenCalledWith('The city has already been added!');
    expect(mockFetch).toHaveBeenCalledTimes(2); // No API requests should be made (only initial)
    expect(mockSetCities).not.toHaveBeenCalledWith(
      expect.arrayContaining(['kYiv'])
    );
  });
});
