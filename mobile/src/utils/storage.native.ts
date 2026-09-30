import * as SecureStore from "expo-secure-store";

/**
 * A SecureStore read or write that fails is NOT the same as "no value stored".
 * Returning null on a failed read made one transient Keystore error look identical
 * to a signed-out session, and silently logging the user out. A failed write looked
 * like a persisted token that vanished on the next cold start. Both now throw, so
 * the caller decides what a storage failure means instead of it being flattened
 * into a value that reads as a legitimate state.
 *
 * The thrown message deliberately names neither the key nor the platform error
 * detail, so a key name cannot leak into a production log.
 */
function storageFailure(operation: "read" | "write" | "remove"): Error {
  return new Error(`SecureStore ${operation} failed`);
}

function warnOnce(message: string, error: unknown): void {
  if (!__DEV__) return;
  console.warn(message, error);
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      warnOnce("[SecureStore] read failed", error);
      throw storageFailure("read");
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      warnOnce("[SecureStore] write failed", error);
      throw storageFailure("write");
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      warnOnce("[SecureStore] remove failed", error);
      throw storageFailure("remove");
    }
  },
};
