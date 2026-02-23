import type { ApiEnvelope, UploadMediaResponse } from "../types";
import http, { unwrap } from "./http";

type Envelope<T> = ApiEnvelope<T>;

export const mediaService = {
  /**
   * Upload 1 file (field: "file") → backend return { url, filename }
   */
  async uploadOne(file: File, purpose = "agent-products"): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("purpose", purpose);

    const res = await http.post<Envelope<UploadMediaResponse>>(
      "/media/upload",
      fd
    );

    const data = unwrap(res.data);

    return data.url ?? "";
  },

  /**
   * Upload banyak file (field: "files") → backend return { urls: string[] }
   */
  async uploadMany(
    files: File[],
    purpose = "agent-products"
  ): Promise<string[]> {
    if (!files.length) return [];

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    fd.append("purpose", purpose);

    const res = await http.post<Envelope<UploadMediaResponse>>(
      "/media/upload",
      fd
    );

    const data = unwrap(res.data);

    if (Array.isArray(data.urls) && data.urls.length > 0) {
      return data.urls.filter(Boolean);
    }

    if (data.url) {
      return [data.url];
    }

    return [];
  },
};