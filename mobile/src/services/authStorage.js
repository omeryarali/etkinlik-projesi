import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";
const authListeners = new Set();

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
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
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
    return null;
  }
}

export async function clearAuthData() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
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
