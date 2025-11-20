// __tests__/CitySearch.test.js
jest.mock('@/app/hooks/useDebounce', () => (value) => value);

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CitySearch } from '@/app/components/CitySearch/CitySearch';

global.fetch = jest.fn();

const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

const mockOnAddCity = jest.fn();

const mockSuggestions = [
  { name: 'Kyiv', country: 'UA', fullName: 'Kyiv, UA' },
  { name: 'Lviv', country: 'UA', fullName: 'Lviv, UA' },
];

describe('CitySearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupSuccessMock = () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockSuggestions,
    });
  };

  it('should render and not call fetch on initial render', () => {
    render(<CitySearch onAddCity={mockOnAddCity} />);
    expect(screen.getByPlaceholderText(/Enter the city/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should not call fetch if input is less than 3 characters', async () => {
    setupSuccessMock();
    render(<CitySearch onAddCity={mockOnAddCity} />);
    const input = screen.getByPlaceholderText(/Enter the city/i);

    fireEvent.change(input, { target: { value: 'Ky' } });

    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    });

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should call fetch and display suggestions when typing 3+ characters', async () => {
    setupSuccessMock();
    render(<CitySearch onAddCity={mockOnAddCity} />);
    const input = screen.getByPlaceholderText(/Enter the city/i);

    fireEvent.change(input, { target: { value: 'Kyi' } });

    const kyivSuggestion = await screen.findByText(/Kyiv, UA/i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/geocode?q=Kyi&limit=5');
    expect(kyivSuggestion).toBeInTheDocument();
    expect(screen.getByText(/Lviv, UA/i)).toBeInTheDocument();
  });

  it('should call onAddCity with full name and clear state when a suggestion is clicked', async () => {
    setupSuccessMock();
    render(<CitySearch onAddCity={mockOnAddCity} />);
    const input = screen.getByPlaceholderText(/Enter the city/i);

    fireEvent.change(input, { target: { value: 'Kyi' } });

    const suggestion = await screen.findByText('Kyiv, UA');

    // Mock onAddCity as async function
    mockOnAddCity.mockResolvedValue(undefined);

    fireEvent.click(suggestion);

    expect(mockOnAddCity).toHaveBeenCalledWith('Kyiv, UA');

    // Wait for onAddCity to complete
    await waitFor(() => {
      expect(mockOnAddCity).toHaveBeenCalled();
    });

    // After clicking suggestion, input is set to full name and suggestions are cleared
    // (according to code: setCityInput(suggestionName) and setSuggestions([]))
    expect(input.value).toBe('Kyiv, UA');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should handle API response error (res.ok is false)', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Rate limit exceeded' }),
    });

    render(<CitySearch onAddCity={mockOnAddCity} />);

    fireEvent.change(screen.getByPlaceholderText(/Enter the city/i), {
      target: { value: 'Error' },
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to fetch suggestions:',
        'Rate limit exceeded'
      );
    });

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should handle network/fetch error (try/catch block)', async () => {
    fetch.mockRejectedValue(new Error('Network disconnected'));

    render(<CitySearch onAddCity={mockOnAddCity} />);

    fireEvent.change(screen.getByPlaceholderText(/Enter the city/i), {
      target: { value: 'Net' },
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Network error fetching suggestions:',
        expect.any(Error)
      );
    });

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should call onAddCity and clear input on form submit', async () => {
    render(<CitySearch onAddCity={mockOnAddCity} />);
    const input = screen.getByPlaceholderText(/Enter the city/i);
    const button = screen.getByRole('button', { name: /➕ Add a city/i });

    fireEvent.change(input, { target: { value: 'Odesa' } });
    fireEvent.click(button);

    expect(button).toHaveTextContent('Adding...');
    expect(mockOnAddCity).toHaveBeenCalledWith('Odesa');

    await waitFor(() => {
      expect(input.value).toBe('');
      expect(button).toHaveTextContent('Add a city');
    });
  });
});
