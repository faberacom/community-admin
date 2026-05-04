import { apiClient } from "@/src/lib/api-client";

export const storageService = {
  async getUploadUrl(params: {
    folder: string;
    fileExtension: string;
    contentType: string;
    fileSizeBytes: number;
  }): Promise<{ uploadUrl: string; url: string }> {
    const res = await apiClient.post<{ uploadUrl: string; url: string }>(
      "/storage/upload-url",
      params,
    );
    return res.data;
  },

  async uploadFile(uploadUrl: string, file: File | Blob): Promise<void> {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
  },
};
