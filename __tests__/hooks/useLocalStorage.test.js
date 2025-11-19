// __tests__/hooks/useLocalStorage.test.js
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';

// Мокаємо window.localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    },
    getStore: () => store,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should initialize with initialValue if nothing is in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));

    // Перевіряємо, що після ініціалізації значення 'default'
    expect(result.current[0]).toBe('default');
  });

  it('should load value from localStorage after hydration', () => {
    localStorageMock.setItem('testKey', JSON.stringify('storedValue'));

    // Початкове значення (SSR) має бути 'default'
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));

    // Після useEffect (гідратації) має бути 'storedValue'
    expect(result.current[0]).toBe('storedValue');
  });

  it('should update localStorage when the state changes', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));
    const [_, setter] = result.current;

    act(() => {
      setter('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    // Перевіряємо, що localStorage оновлено
    expect(localStorageMock.getItem('testKey')).toBe(
      JSON.stringify('newValue')
    );
  });
});
