import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useNearbyProfiles } from "@/hooks/useNearbyProfiles";
import { mockSupabaseRpc } from "../setup";

beforeEach(() => {
  jest.clearAllMocks();
});

// Helper to set RPC mock response without TS complaints about mock types
function setRpcResult(data: any, error: any = null) {
  mockSupabaseRpc.mockResolvedValue({ data, error } as any);
}

describe("useNearbyProfiles", () => {
  it("starts with empty profiles", () => {
    const { result } = renderHook(() => useNearbyProfiles());
    expect(result.current.profiles).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("fetchNearby sets profiles on success", async () => {
    const mockProfiles = [
      { id: "p1", name: "Alice", distance_km: 5 },
      { id: "p2", name: "Bob", distance_km: 10 },
    ];

    setRpcResult(mockProfiles);

    const { result } = renderHook(() => useNearbyProfiles());

    await act(async () => {
      await result.current.fetchNearby(40.7, -74.0);
    });

    expect(result.current.profiles).toEqual(mockProfiles);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error on RPC failure", async () => {
    setRpcResult(null, { message: "RPC failed" });

    const { result } = renderHook(() => useNearbyProfiles());

    await act(async () => {
      await result.current.fetchNearby(40.7, -74.0);
    });

    expect(result.current.error).toBe("RPC failed");
    expect(result.current.loading).toBe(false);
  });

  it("passes mode filter to RPC", async () => {
    setRpcResult([]);

    const { result } = renderHook(() =>
      useNearbyProfiles({ mode: "dating", radiusKm: 25 }),
    );

    await act(async () => {
      await result.current.fetchNearby(40.7, -74.0);
    });

    expect(mockSupabaseRpc).toHaveBeenCalledWith("nearby_profiles", {
      user_lat: 40.7,
      user_lng: -74.0,
      radius_km: 25,
      filter_mode: "dating",
    });
  });

  it("passes 'friends' as filter_mode when mode is 'all'", async () => {
    setRpcResult([]);

    const { result } = renderHook(() =>
      useNearbyProfiles({ mode: "all" }),
    );

    await act(async () => {
      await result.current.fetchNearby(40.7, -74.0);
    });

    expect(mockSupabaseRpc).toHaveBeenCalledWith("nearby_profiles",
      expect.objectContaining({ filter_mode: "friends" }),
    );
  });
});
