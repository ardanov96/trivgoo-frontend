import { ApiEnvelope } from "@/types";
import axios from "axios";

// allow overriding via environment variable (VITE_API_BASE_URL)
// if undefined or empty, default to a relative path so the frontend can work
// in both development and production without hardcoding hostnames.
const apiBase = import.meta.env.VITE_API_BASE_URL || "";

const http = axios.create({
  baseURL: apiBase ? `${apiBase}/api/v1` : "/api/v1",
  withCredentials: true,
  headers: { Accept: "application/json" },
});

http.interceptors.request.use((config) => {
  const isFormData = config.data instanceof FormData;

  if (isFormData) {
    if (config.headers) delete (config.headers as any)["Content-Type"];
  } else {
    (config.headers as any)["Content-Type"] = "application/json";
  }
  return config;
});

export default http;

export function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope.error) throw new Error(envelope.message || "Request failed");
  return envelope.data;
}
