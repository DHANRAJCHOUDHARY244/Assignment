import { API_BASE_URL, API_PATHS } from "@/constants/api";
import { getAccessToken } from "@/lib/session";
import type { ApiSuccess } from "@/types";

const CHUNK_SIZE = 5 * 1024 * 1024;
const DIRECT_LIMIT = 50 * 1024 * 1024;
const MAX_BYTES = 2 * 1024 * 1024 * 1024;

type UploadResult = {
  url: string;
  thumbnailUrl: string;
};

type InitResponse = {
  uploadId: string;
  chunkSize: number;
};

export type UploadPhase = "uploading" | "processing" | "saving" | "done";

export type UploadStatus = {
  phase: UploadPhase;
  percent: number;
  message: string;
};

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { msg?: string; message?: string };
    return body.msg ?? body.message ?? `Upload failed (${response.status})`;
  } catch {
    return `Upload failed (${response.status})`;
  }
}

function emit(
  onStatus: ((status: UploadStatus) => void) | undefined,
  status: UploadStatus,
) {
  onStatus?.(status);
}

async function uploadChunked(
  file: File,
  onStatus?: (status: UploadStatus) => void,
): Promise<UploadResult> {
  const token = getAccessToken();
  const initRes = await fetch(`${API_BASE_URL}${API_PATHS.ADMIN_UPLOADS}/init`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      filename: file.name,
      totalSize: file.size,
      mimeType: file.type || "video/mp4",
    }),
  });

  if (!initRes.ok) throw new Error(await parseError(initRes));

  const initJson = (await initRes.json()) as ApiSuccess<InitResponse>;
  const { uploadId, chunkSize } = initJson.data;
  const step = chunkSize || CHUNK_SIZE;
  let offset = 0;

  while (offset < file.size) {
    const slice = file.slice(offset, offset + step);
    const chunkRes = await fetch(
      `${API_BASE_URL}${API_PATHS.ADMIN_UPLOADS}/${uploadId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/octet-stream",
          "Upload-Offset": String(offset),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: slice,
      },
    );

    if (!chunkRes.ok) throw new Error(await parseError(chunkRes));

    offset += slice.size;
    const uploadPct = Math.min(80, Math.round((offset / file.size) * 80));
    emit(onStatus, {
      phase: "uploading",
      percent: uploadPct,
      message: `Uploading video… ${uploadPct}%`,
    });
  }

  emit(onStatus, {
    phase: "processing",
    percent: 85,
    message: "Generating thumbnail from first frame…",
  });

  const completeRes = await fetch(
    `${API_BASE_URL}${API_PATHS.ADMIN_UPLOADS}/${uploadId}/complete`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!completeRes.ok) throw new Error(await parseError(completeRes));

  const done = (await completeRes.json()) as ApiSuccess<UploadResult>;
  emit(onStatus, {
    phase: "done",
    percent: 100,
    message: "Upload complete",
  });
  return done.data;
}

async function uploadDirect(
  file: File,
  onStatus?: (status: UploadStatus) => void,
): Promise<UploadResult> {
  emit(onStatus, {
    phase: "uploading",
    percent: 20,
    message: "Uploading video…",
  });

  const token = getAccessToken();
  const form = new FormData();
  form.append("video", file);

  emit(onStatus, {
    phase: "processing",
    percent: 70,
    message: "Generating thumbnail from first frame…",
  });

  const res = await fetch(`${API_BASE_URL}${API_PATHS.ADMIN_UPLOADS}/direct`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!res.ok) throw new Error(await parseError(res));

  const json = (await res.json()) as ApiSuccess<UploadResult>;
  emit(onStatus, {
    phase: "done",
    percent: 100,
    message: "Upload complete",
  });
  return json.data;
}

export async function uploadAdminVideo(
  file: File,
  onStatus?: (status: UploadStatus) => void,
): Promise<UploadResult> {
  if (file.size > MAX_BYTES) {
    throw new Error("File exceeds maximum upload size of 2 GB");
  }

  if (file.size <= DIRECT_LIMIT) {
    return uploadDirect(file, onStatus);
  }

  return uploadChunked(file, onStatus);
}
