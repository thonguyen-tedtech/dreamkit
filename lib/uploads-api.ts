import { API_BASE_URL, parseApiError } from "./api-client";

export interface UploadImageSuccess {
  readonly ok: true;
  readonly url: string;
  readonly key: string;
}

export interface UploadImageFailure {
  readonly ok: false;
  readonly message: string;
}

export type UploadImageResult = UploadImageSuccess | UploadImageFailure;

/** Uploads an image file to the backend. Admin only. */
export async function uploadImageApi(
  accessToken: string,
  file: File,
): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/uploads/local-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (!response.ok) {
      return { ok: false, message: await parseApiError(response) };
    }

    const data = (await response.json()) as { url: string; key: string };
    return { ok: true, url: data.url, key: data.key };
  } catch {
    return {
      ok: false,
      message: "Không thể kết nối máy chủ. Vui lòng thử lại sau.",
    };
  }
}
