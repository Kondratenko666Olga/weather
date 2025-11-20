// __tests__/hooks/useDebounce.test.js
import { renderHook, act } from '@testing-library/react';
import useDebounce from '@/app/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should update value after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'initial' },
      }
    );

    expect(result.current).toBe('initial');

    // Change value through rerender
    act(() => {
      rerender({ value: 'new value' });
    });

    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('new value');
  });

  it('should cancel the previous timeout if value changes before delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'initial' },
      }
    );

    act(() => {
      rerender({ value: 'first change' });
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current).toBe('initial');

    act(() => {
      rerender({ value: 'second change' });
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current).toBe('second change');
  });

  it('should not reset the timer if the component re-renders but value is the same', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'stable', delay: 500 },
      }
    );

    const initialTimeoutCount = jest.getTimerCount();

    act(() => {
      rerender({ value: 'stable', delay: 500 });
    });

    expect(jest.getTimerCount()).toBe(initialTimeoutCount);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('stable');
  });
});
