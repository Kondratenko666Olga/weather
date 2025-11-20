// __tests__/CityCard.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { CityCard } from '@/app/components/CityCard/CityCard';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority: _priority, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt || ''} {...props} />
  ),
}));

const mockWeatherData = {
  name: 'TestCity',
  temp: 20,
  description: 'sunny',
  icon: '01d',
  updatedAt: '12:00:00',
  fullData: {
    main: {
      temp: 20,
      feels_like: 18,
      temp_min: 15,
      temp_max: 25,
      pressure: 1013,
      humidity: 60,
    },
    wind: {
      speed: 5,
    },
  },
};

const mockOnRefresh = jest.fn();
const mockOnRemove = jest.fn();

describe('CityCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render city card with weather data', () => {
    render(
      <CityCard
        weather={mockWeatherData}
        onRefresh={mockOnRefresh}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('TestCity')).toBeInTheDocument();
    expect(screen.getByText('20°C')).toBeInTheDocument();
    expect(screen.getByText('sunny')).toBeInTheDocument();
  });

  it('should call onRefresh when refresh button is clicked', () => {
    render(
      <CityCard
        weather={mockWeatherData}
        onRefresh={mockOnRefresh}
        onRemove={mockOnRemove}
      />
    );

    const refreshButton = screen.getByRole('button', {
      name: /🔄 Update now/i,
    });
    fireEvent.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('should call onRemove when remove button is clicked', () => {
    render(
      <CityCard
        weather={mockWeatherData}
        onRefresh={mockOnRefresh}
        onRemove={mockOnRemove}
      />
    );

    const removeButton = screen.getByRole('button', { name: /🗑️ Delete/i });
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('should show and hide DetailedView on click', () => {
    render(
      <CityCard
        weather={mockWeatherData}
        onRefresh={mockOnRefresh}
        onRemove={mockOnRemove}
      />
    );

    expect(
      screen.queryByText(/Detailed weather forecast/i)
    ).not.toBeInTheDocument();

    // Click on city card (on div with cardInfo)
    const cardInfo = screen.getByText('TestCity').closest('div');
    fireEvent.click(cardInfo);

    // Verify that modal window appeared
    expect(
      screen.getByText('TestCity (Detailed weather forecast)')
    ).toBeInTheDocument();

    // Check details in modal window
    expect(screen.getByText(/Humidity:/i)).toBeInTheDocument();
    expect(screen.getByText(/60/i)).toBeInTheDocument();
    expect(screen.getByText(/Min. \/ Max. temp.:/i)).toBeInTheDocument();
    expect(screen.getByText(/15°C/i)).toBeInTheDocument();
    expect(screen.getByText(/Wind speed:/i)).toBeInTheDocument();
    expect(screen.getByText(/5 m\/s/i)).toBeInTheDocument();

    // Close modal window
    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

    expect(
      screen.queryByText(/Detailed weather forecast/i)
    ).not.toBeInTheDocument();
  });
});
