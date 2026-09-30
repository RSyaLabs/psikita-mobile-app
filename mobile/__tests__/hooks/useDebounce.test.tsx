import { renderHook, act } from "@testing-library/react-native";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce Hook Suite", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("harus mengembalikan nilai awal secara langsung", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("harus menunda pembaruan nilai hingga delay selesai", () => {
    let value = "start";
    const { result, rerender } = renderHook(() => useDebounce(value, 300));

    expect(result.current).toBe("start");

    // Ubah nilai
    value = "changed";
    rerender({});

    // Sebelum timer habis, nilai lama tetap dipakai
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(result.current).toBe("start");

    // Setelah timer habis, nilai diperbarui
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(result.current).toBe("changed");
  });
});
