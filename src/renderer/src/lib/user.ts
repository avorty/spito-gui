import { ProfileInterface, Settings, tagInterface, newRuleset } from "./interfaces";
import { backendRequest, backendRequestWithFiles } from "./request";

export const getUserAvatar = async (userId: number): Promise<Blob | null> => {
  const res = await backendRequest(`user/settings/avatar/${userId}`, "GET");
  if (!res.ok || res.status === 204) return null;
  return await res.blob();
};

export const getSettings = async (): Promise<Settings | null> => {
  const response = await backendRequest("user/settings", "GET");
  if (response.status === 200) {
    return await response.json();
  }
  return null;
};

export const updateSettings = async (data: Settings): Promise<boolean> => {
  const response = await backendRequest("user/settings", "PUT", data);
  return response.ok;
};

export const updateAvatar = async (data: FormData): Promise<boolean> => {
  const response = await backendRequestWithFiles("user/settings/avatar", "PUT", data);
  return response.ok;
};

export const getUserProfile = async (userId: number): Promise<ProfileInterface> => {
  const response = await backendRequest(`user/${userId}`, "GET");
  if (response.status === 200) {
    return await response.json();
  }
  throw new Error();
};

export const getTagHints = async (query: string): Promise<{tags: Array<tagInterface>}> => {
  const response = await backendRequest(`tag?search=${query}`, "GET");
  if (response.status === 200) {
    return await response.json();
  }
  throw new Error();
}

export const createRuleset = async (data: newRuleset): Promise<boolean> => {
  const response = await backendRequest("ruleset", "POST", data);
  return response.ok;
}
