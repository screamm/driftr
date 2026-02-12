import { useAuthStore } from "@/stores/auth-store";
import { createMockQueryBuilder, mockSupabaseFrom, mockSupabaseAuth } from "../setup";

// Reset store between tests
beforeEach(() => {
  useAuthStore.setState({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    isOnboarded: false,
    error: null,
  });
  jest.clearAllMocks();
});

describe("auth-store", () => {
  describe("setSession", () => {
    it("sets session and user, clears isLoading", () => {
      const mockSession = {
        user: { id: "user-1", email: "test@test.com" },
        access_token: "token",
      } as any;

      useAuthStore.getState().setSession(mockSession);

      const state = useAuthStore.getState();
      expect(state.session).toBe(mockSession);
      expect(state.user).toEqual(mockSession.user);
      expect(state.isLoading).toBe(false);
    });

    it("clears user when session is null", () => {
      useAuthStore.getState().setSession(null);

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe("setProfile", () => {
    it("sets isOnboarded true when name and avatar_url exist", () => {
      const profile = { id: "1", name: "Jane", avatar_url: "https://img.jpg" } as any;
      useAuthStore.getState().setProfile(profile);

      const state = useAuthStore.getState();
      expect(state.profile).toBe(profile);
      expect(state.isOnboarded).toBe(true);
    });

    it("sets isOnboarded false when name is missing", () => {
      const profile = { id: "1", name: null, avatar_url: "https://img.jpg" } as any;
      useAuthStore.getState().setProfile(profile);

      expect(useAuthStore.getState().isOnboarded).toBe(false);
    });

    it("sets isOnboarded false when avatar_url is missing", () => {
      const profile = { id: "1", name: "Jane", avatar_url: null } as any;
      useAuthStore.getState().setProfile(profile);

      expect(useAuthStore.getState().isOnboarded).toBe(false);
    });
  });

  describe("fetchProfile", () => {
    it("fetches and sets profile on success", async () => {
      const mockProfile = { id: "user-1", name: "Jane", avatar_url: "https://img.jpg" };

      useAuthStore.setState({ user: { id: "user-1" } as any });

      mockSupabaseFrom.mockReturnValue(
        createMockQueryBuilder({ data: mockProfile, error: null }),
      );

      await useAuthStore.getState().fetchProfile();

      const state = useAuthStore.getState();
      expect(state.profile).toEqual(mockProfile);
      expect(state.isOnboarded).toBe(true);
      expect(state.error).toBeNull();
    });

    it("sets error on failure", async () => {
      useAuthStore.setState({ user: { id: "user-1" } as any });

      mockSupabaseFrom.mockReturnValue(
        createMockQueryBuilder({ data: null, error: { message: "DB error" } }),
      );

      await useAuthStore.getState().fetchProfile();

      expect(useAuthStore.getState().error).toBe("DB error");
    });

    it("does nothing when user is null", async () => {
      useAuthStore.setState({ user: null });

      await useAuthStore.getState().fetchProfile();

      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });
  });

  describe("signOut", () => {
    it("clears all state", async () => {
      useAuthStore.setState({
        session: { access_token: "t" } as any,
        user: { id: "1" } as any,
        profile: { id: "1" } as any,
        isOnboarded: true,
        error: "old error",
      });

      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isOnboarded).toBe(false);
      expect(state.error).toBeNull();
    });

    it("clears state even if signOut throws", async () => {
      useAuthStore.setState({
        session: { access_token: "t" } as any,
        user: { id: "1" } as any,
      });

      mockSupabaseAuth.signOut.mockRejectedValueOnce(new Error("Network error"));

      await useAuthStore.getState().signOut();

      expect(useAuthStore.getState().session).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
