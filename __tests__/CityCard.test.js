// __tests__/CityCard.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { CityCard } from '@/app/components/CityCard/CityCard';

const mockWeatherData = {
  name: 'TestCity',
  temp: 15.5,
  description: 'clear sky',
  icon: '01d',
  updatedAt: '12:00:00',
  fullData: {
    main: {
      temp: 15.5,
      feels_like: 14,
      temp_min: 10,
      temp_max: 20,
      humidity: 60,
      pressure: 1012,
    },
    wind: { speed: 5 },
  },
};

describe('CityCard', () => {
  const mockOnRefresh = jest.fn();
  const mockOnRemove = jest.fn();

  it('should render basic weather data and action buttons', () => {
    render(
      <CityCard
        weather={mockWeatherData}
        onRefresh={mockOnRefresh}
        onRemove={mockOnRemove}
      />
    );

    // Перевіряємо відображення основних даних
    expect(
      screen.getByRole('heading', { name: /TestCity/i })
    ).toBeInTheDocument();
    expect(screen.getByText('16°C')).toBeInTheDocument(); // Температура округлюється
    expect(screen.getByText('clear sky')).toBeInTheDocument();

    // Перевіряємо кнопки
    expect(
      screen.getByRole('button', { name: /Оновити зараз/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Видалити/i })
    ).toBeInTheDocument();
  });

  it('should call onRefresh and onRemove when buttons are clicked', () => {
    render(
      <CityCard
        weather={mockWeatherData}
        onRefresh={mockOnRefresh}
        onRemove={mockOnRemove}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Оновити зараз/i }));
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Видалити/i }));
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

    // 1. Модального вікна немає
    expect(
      screen.queryByText(/Detailed weather forecast/i)
    ).not.toBeInTheDocument();

    // 2. Клікаємо на область картки для відкриття модального вікна
    fireEvent.click(screen.getByText('TestCity'));

    // 3. Перевіряємо, що модальне вікно з'явилося
    const modalTitle = screen.getByText('TestCity (Detailed weather forecast)');
    expect(modalTitle).toBeInTheDocument();
    expect(screen.getByText(/Humidity: 60%/i)).toBeInTheDocument();

    // 4. Клікаємо на кнопку закриття
    fireEvent.click(screen.getByRole('button', { name: /Close/i }));

    // 5. Модального вікна немає
    expect(modalTitle).not.toBeInTheDocument();
  });
});
