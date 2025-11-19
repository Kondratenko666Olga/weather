// __tests__/CitySearch.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CitySearch } from '@/app/components/CitySearch/CitySearch';

// Мокаємо хук useDebounce, щоб не чекати 500ms у тестах
jest.mock('@/app/hooks/useDebounce', () => (value, _) => value);

// Мокаємо API Geocoding
global.fetch = jest.fn();

const mockSuggestions = [
  { fullName: 'Kyiv, Ukraine' },
  { fullName: 'Kharkiv, Ukraine' },
];

describe('CitySearch', () => {
  const mockOnAddCity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update input value when typing', () => {
    render(<CitySearch onAddCity={mockOnAddCity} />);
    const input = screen.getByPlaceholderText(/Введіть назву міста/i);

    fireEvent.change(input, { target: { value: 'Odesa' } });
    expect(input).toHaveValue('Odesa');
  });

  it('should call onAddCity and clear input on submit', async () => {
    render(<CitySearch onAddCity={mockOnAddCity} />);
    const input = screen.getByPlaceholderText(/Введіть назву міста/i);
    const addButton = screen.getByRole('button', { name: /Додати місто/i });

    fireEvent.change(input, { target: { value: 'Lviv' } });
    fireEvent.click(addButton);

    // Перевіряємо виклик функції
    await waitFor(() => {
      expect(mockOnAddCity).toHaveBeenCalledWith('Lviv');
    });

    // Перевіряємо, що поле очистилося
    expect(input).toHaveValue('');
  });

  it('should display and select suggestions when typing', async () => {
    // Налаштовуємо мок-відповідь для fetch (для підказок)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuggestions,
    });

    render(<CitySearch onAddCity={mockOnAddCity} />);
    const input = screen.getByPlaceholderText(/Введіть назву міста/i);

    // Введення тексту (3+ символи для активації підказок)
    fireEvent.change(input, { target: { value: 'Kyi' } });

    // Очікуємо появи підказок
    await waitFor(() => {
      expect(screen.getByText('Kyiv, Ukraine')).toBeInTheDocument();
      expect(screen.getByText('Kharkiv, Ukraine')).toBeInTheDocument();
    });

    // Клікаємо на підказку
    fireEvent.click(screen.getByText('Kharkiv, Ukraine'));

    // Перевіряємо, що поле оновилося і викликана функція onAddCity
    await waitFor(() => {
      expect(input).toHaveValue('Kharkiv, Ukraine');
    });

    await waitFor(() => {
      expect(mockOnAddCity).toHaveBeenCalledWith('Kharkiv, Ukraine');
    });

    // Перевіряємо, що список підказок зник
    expect(screen.queryByText('Kyiv, Ukraine')).not.toBeInTheDocument();
  });
});
