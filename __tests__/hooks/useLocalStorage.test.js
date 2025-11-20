// __tests__/hooks/useLocalStorage.test.js
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      if (value === 'null') throw new Error('Quota exceeded');
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it('should initialize with initialValue if nothing is in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should load value from localStorage', () => {
    localStorageMock.setItem('testKey', JSON.stringify('storedValue'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));
    expect(result.current[0]).toBe('storedValue');
  });

  it('should update localStorage when the state changes', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorageMock.getItem('testKey')).toBe(
      JSON.stringify('newValue')
    );
  });

  it('should use initialValue and log error if stored value is invalid JSON', () => {
    localStorageMock.setItem('testKey', 'invalid json string');

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error reading localStorage key “testKey”:',
      expect.any(SyntaxError)
    );
    expect(result.current[0]).toBe('initial');
  });

  it('should log error when unable to write to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1](null);
    });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error writing to localStorage key “testKey”:',
      expect.any(Error)
    );
  });

  it('should return initialValue if window is undefined (SSR/SSG)', () => {
    const originalWindow = global.window;

    // Remove window from global
    delete global.window;

    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue')
    );

    expect(result.current[0]).toBe('initialValue');

    // Restore window
    global.window = originalWindow;
  });
});
