import { ApiEnvelope } from "@/types";
import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const http = axios.create({
  baseURL: apiBase,
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
