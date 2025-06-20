import { Api } from "./Api";

function getApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error("VITE_API_URL is not defined in the environment variables");
  }
  return apiUrl;
}

export function getApi() {
  const apiUrl = getApiUrl();
  return new Api({
    baseURL: apiUrl,
  });
}
