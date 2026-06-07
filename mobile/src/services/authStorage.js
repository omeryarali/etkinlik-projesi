import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";
const authListeners = new Set();

function sanitizeAuthUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const { token: _token, ...safeUser } = user;
  return safeUser;
}

function emitAuthChange() {
  authListeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.warn("Auth listener error:", error);
    }
  });
}

export async function saveAuthData(token, user) {
  const safeUser = sanitizeAuthUser(user);

  if (!token || !safeUser) {
    await clearAuthData();
    return;
  }

  const nextUserRaw = JSON.stringify(safeUser);
  const storedEntries = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  const storedToken = storedEntries[0]?.[1] ?? null;
  const storedUserRaw = storedEntries[1]?.[1] ?? null;

  if (storedToken === token && storedUserRaw === nextUserRaw) {
    return;
  }

  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, nextUserRaw],
  ]);

  emitAuthChange();
}

export async function getAuthToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function getAuthUser() {
  const userRaw = await AsyncStorage.getItem(USER_KEY);

  if (!userRaw) {
    return null;
  }

  try {
    return JSON.parse(userRaw);
  } catch {
    await clearAuthData();
    return null;
  }
}

export async function clearAuthData() {
  const storedEntries = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  const hasStoredToken = !!storedEntries[0]?.[1];
  const hasStoredUser = !!storedEntries[1]?.[1];

  if (!hasStoredToken && !hasStoredUser) {
    return;
  }

  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  emitAuthChange();
}

export async function isLoggedIn() {
  const token = await getAuthToken();
  const user = await getAuthUser();

  return !!token && !!user;
}

export function subscribeAuthChange(listener) {
  authListeners.add(listener);

  return () => {
    authListeners.delete(listener);
  };
}
