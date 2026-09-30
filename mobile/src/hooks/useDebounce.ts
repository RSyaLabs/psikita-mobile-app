import { useState, useEffect } from "react";

/**
 * Lightweight standard-library hook to debounce values (keystrokes, search filters)
 * Mencegah banjir network request (Search DDoS) ke database server
 *
 * @param value Nilai yang ingin di-debounce
 * @param delayMs Jeda waktu dalam milidetik (default: 350ms)
 */
export function useDebounce<T>(value: T, delayMs: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
