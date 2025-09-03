import '@testing-library/jest-dom';

// Mock localStorage for tests
const localStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

global.localStorage = localStorageMock;

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});