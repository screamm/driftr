import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useWaveLimit } from "@/hooks/useWaveLimit";
import { useAuthStore } from "@/stores/auth-store";
import { FREE_WAVE_LIMIT } from "@/lib/constants";
import { createMockQueryBuilder, mockSupabaseFrom, mockSupabaseRpc } from "../setup";

// Mock the usePremium hook
jest.mock("@/hooks/usePremium", () => ({
  usePremium: jest.fn().mockReturnValue({ isPremium: false, loading: false }),
}));

import { usePremium } from "@/hooks/usePremium";
const mockUsePremium = usePremium as jest.MockedFunction<typeof usePremium>;

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: { id: "user-1" } as any });
  mockUsePremium.mockReturnValue({ isPremium: false, loading: false });
});

describe("useWaveLimit", () => {
  it("FREE_WAVE_LIMIT is 3", () => {
    expect(FREE_WAVE_LIMIT).toBe(3);
  });

  it("canWave is true when under limit", async () => {
    mockSupabaseFrom.mockReturnValue(
      createMockQueryBuilder({ data: { count: 1 }, error: null }),
    );

    const { result } = renderHook(() => useWaveLimit());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canWave).toBe(true);
    expect(result.current.wavesRemaining).toBe(2);
  });

  it("canWave is false when at limit", async () => {
    mockSupabaseFrom.mockReturnValue(
      createMockQueryBuilder({ data: { count: 3 }, error: null }),
    );

    const { result } = renderHook(() => useWaveLimit());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canWave).toBe(false);
    expect(result.current.wavesRemaining).toBe(0);
  });

  it("premium users have unlimited waves", async () => {
    mockUsePremium.mockReturnValue({ isPremium: true, loading: false });

    const { result } = renderHook(() => useWaveLimit());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canWave).toBe(true);
    expect(result.current.wavesRemaining).toBe(Infinity);
  });

  it("incrementWave calls RPC", async () => {
    mockSupabaseFrom.mockReturnValue(
      createMockQueryBuilder({ data: { count: 0 }, error: null }),
    );
    mockSupabaseRpc.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useWaveLimit());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.incrementWave();
    });

    expect(mockSupabaseRpc).toHaveBeenCalledWith("increment_wave_count", {
      p_user_id: "user-1",
      p_date: expect.any(String),
    });
  });

  it("skips fetch when user is null", async () => {
    useAuthStore.setState({ user: null });

    const { result } = renderHook(() => useWaveLimit());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockSupabaseFrom).not.toHaveBeenCalled();
  });
});
