// __tests__/WeatherApp.test.js

// ➡️ 1. Мокаємо useLocalStorage ПЕРЕД імпортами.
// Це стандартна практика Jest/ES Modules.
// Тут ми використовуємо статичний import, але jest.mock працює на рівні файлу.
jest.mock('../app/hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn(),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WeatherApp } from '@/app/components/WeatherApp/WeatherApp';
// ✅ ВИПРАВЛЕННЯ: Коректний шлях до хука
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
// Мокаємо fetch (для запитів погоди)
global.fetch = jest.fn();

// Фейкові дані про погоду, які повертатиме API
const mockFetchResponse = (name) => ({
  ok: true,
  json: async () => ({
    name: name,
    main: {
      temp: 20,
      feels_like: 18,
      temp_min: 15,
      temp_max: 25,
      humidity: 50,
      pressure: 1010,
    },
    weather: [{ description: 'sunny', icon: '01d' }],
  }),
});

describe('WeatherApp', () => {
  let mockCityNames;
  let mockSetCityNames;

  beforeEach(() => {
    jest.clearAllMocks();

    // 1. Ініціалізуємо стан для тесту
    mockCityNames = ['Kyiv', 'Lviv'];

    // 2. Функція, що імітує оновлення стану та LocalStorage
    mockSetCityNames = jest.fn((updater) => {
      mockCityNames =
        typeof updater === 'function' ? updater(mockCityNames) : updater;
    });

    // ➡️ 3. Налаштовуємо мок, використовуючи імпортований мок-хук
    useLocalStorage.mockImplementation(() => {
      return [mockCityNames, mockSetCityNames, true]; // true = initialized
    });

    // 4. Налаштовуємо мок для fetch
    fetch.mockImplementation((url) => {
      const cityMatch = url.match(/city=(\w+)/);
      const cityName = cityMatch ? cityMatch[1] : '';
      return Promise.resolve(mockFetchResponse(cityName));
    });
  });

  it('should load initial cities and display weather cards', async () => {
    render(<WeatherApp />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Kyiv, Lviv
    });

    expect(await screen.findByText('Kyiv')).toBeInTheDocument();
    expect(screen.getByText('Lviv')).toBeInTheDocument();
  });

  it('should add a new city when searched', async () => {
    render(<WeatherApp />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    const input = screen.getByPlaceholderText(/Введіть назву міста/i);
    const addButton = screen.getByRole('button', { name: /Додати місто/i });

    fireEvent.change(input, { target: { value: 'Odesa' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    expect(mockSetCityNames).toHaveBeenCalled();

    // Перевіряємо, що функція оновлення була викликана з коректним функціональним оновленням
    const lastCallUpdater =
      mockSetCityNames.mock.calls[mockSetCityNames.mock.calls.length - 1][0];
    expect(lastCallUpdater(['Kyiv', 'Lviv'])).toEqual([
      'Kyiv',
      'Lviv',
      'Odesa',
    ]);
  });

  it('should remove a city when delete button is clicked', async () => {
    render(<WeatherApp />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    const removeButtons = screen.getAllByRole('button', { name: /Видалити/i });

    // Клікаємо на кнопку видалення для Lviv (друга кнопка)
    fireEvent.click(removeButtons[1]);

    expect(mockSetCityNames).toHaveBeenCalled();

    // Перевіряємо, що функція оновлення була викликана з коректним функціональним оновленням (видаленням Lviv)
    const lastCallUpdater = mockSetCityNames.mock.calls[0][0];
    expect(lastCallUpdater(['Kyiv', 'Lviv'])).toEqual(['Kyiv']);

    // Перевіряємо, що Lviv більше не відображається
    await waitFor(() => {
      expect(screen.queryByText('Lviv')).not.toBeInTheDocument();
    });
  });
});
