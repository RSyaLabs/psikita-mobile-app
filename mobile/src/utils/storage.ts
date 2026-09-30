/**
 * Universal Storage Adapter (Web & Testing / Node Environment)
 * On Native (Android / iOS), Metro bundler resolves storage.native.ts directly.
 * Web tokens stay in memory; do not persist bearer tokens in browser storage.
 */
const inMemoryStorage = new Map<string, string>();

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    return inMemoryStorage.get(key) ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    inMemoryStorage.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    inMemoryStorage.delete(key);
  },
};
