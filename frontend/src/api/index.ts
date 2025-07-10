import { Api } from "./Api";

function getApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_HOST || "/";
  return apiUrl;
}

export function getApi() {
  const apiUrl = getApiUrl();
  return new Api({
    baseURL: apiUrl,
    withCredentials: true,
  });
}

export function getSocket() {
  const apiUrl = getApiUrl();
  const socketUrl = apiUrl.replace(/^https?/, "ws");
  return new WebSocket(socketUrl + "ws");
}
