import { ProfileInterface, Settings } from "./interfaces";
import { backendRequest } from "./request";

export const getUserAvatar = async (userId: number): Promise<Blob> => {
  const res = await backendRequest(`user/settings/avatar/${userId}`, "GET");
  if (!res.ok || res.status === 204) throw new Error();
  return await res.blob();
};

export const getUserBanner = async (userId: number): Promise<Blob> => {
  const res = await backendRequest(`user/settings/banner/${userId}`, "GET");
  if (!res.ok || res.status === 204) throw new Error();
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
  const response = await backendRequest("user/settings", "PATCH", data);
  return response.ok;
};

export const getUserProfile = async (userId: number): Promise<ProfileInterface> => {
  const response = await backendRequest(`user/${userId}`, "GET");
  if (response.status === 200) {
    return await response.json();
  }
  throw new Error();
};
