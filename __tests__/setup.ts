// ─── Chainable Supabase mock ───

type MockQueryResult = { data: any; error: any; count?: number };

function createMockQueryBuilder(result: Partial<MockQueryResult> = {}) {
  const resolved: MockQueryResult = {
    data: result.data ?? null,
    error: result.error ?? null,
    count: result.count ?? undefined,
  };

  const builder: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolved),
    maybeSingle: jest.fn().mockResolvedValue(resolved),
    then: (resolve: any) => Promise.resolve(resolved).then(resolve),
  };

  return builder;
}

const mockSupabaseFrom = jest.fn((_table: string) =>
  createMockQueryBuilder(),
);

const mockSupabaseRpc = jest.fn((_fn: string, _params?: any) =>
  Promise.resolve({ data: null, error: null }),
);

const mockSupabaseAuth = {
  getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
  signOut: jest.fn().mockResolvedValue({ error: null }),
  signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
  signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
  onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
};

const mockSupabaseStorage = {
  from: jest.fn((_bucket: string) => ({
    upload: jest.fn().mockResolvedValue({ data: { path: "test-path" }, error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "https://example.com/test.jpg" } }),
    remove: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
};

const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnThis(),
};

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: mockSupabaseFrom,
    rpc: mockSupabaseRpc,
    auth: mockSupabaseAuth,
    storage: mockSupabaseStorage,
    channel: jest.fn().mockReturnValue(mockChannel),
    removeChannel: jest.fn(),
  },
}));

// ─── RevenueCat mock ───

jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: {
    getCustomerInfo: jest.fn().mockResolvedValue({
      entitlements: { active: {} },
    }),
    addCustomerInfoUpdateListener: jest.fn(),
    removeCustomerInfoUpdateListener: jest.fn(),
    configure: jest.fn(),
    logIn: jest.fn().mockResolvedValue({}),
  },
  CustomerInfo: {},
}));

// ─── Expo mocks ───

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 40.7128, longitude: -74.006 },
  }),
  watchPositionAsync: jest.fn().mockResolvedValue({ remove: jest.fn() }),
  Accuracy: { Balanced: 3 },
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Error: "error", Warning: "warning" },
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: "ExponentPushToken[mock]" }),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

// ─── Exports for test files ───

export {
  createMockQueryBuilder,
  mockSupabaseFrom,
  mockSupabaseRpc,
  mockSupabaseAuth,
  mockSupabaseStorage,
};
