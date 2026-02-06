import { ApiEnvelope } from "@/types";
import axios from "axios";

const getBaseURL = () => {
  const envURL = process.env.REACT_APP_API_URL || (import.meta as any).env?.VITE_API_URL;
  // Gunakan fallback manual jika env tidak terbaca
  return `${envURL || "http://192.168.1.99:4000"}/api/v1`; 
};

const http = axios.create({
  // baseURL: "http://localhost:4000/api/v1",
  // withCredentials: true,
  // headers: { Accept: "application/json" },

  baseURL: getBaseURL(), 
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
