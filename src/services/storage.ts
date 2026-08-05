/**
 * Firebase Storage helpers for child media uploads.
 */

import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/config/firebase";

export type UploadFileResult = {
  path: string;
  downloadUrl: string;
};

/**
 * Uploads binary data to Firebase Storage and returns the public download URL.
 */
export async function uploadFile(
  path: string,
  data: Blob | Uint8Array | ArrayBuffer,
  contentType?: string,
): Promise<UploadFileResult> {
  const fileRef = ref(storage, path);

  await uploadBytes(
    fileRef,
    data,
    contentType ? { contentType } : undefined,
  );

  const downloadUrl = await getDownloadURL(fileRef);

  return {
    path,
    downloadUrl,
  };
}

/**
 * Reads a local file URI (expo-audio / FileSystem) and uploads it.
 */
export async function uploadLocalFile(
  path: string,
  localUri: string,
  contentType = "audio/mp4",
): Promise<UploadFileResult> {
  const response = await fetch(localUri);

  if (!response.ok) {
    throw new Error(
      "Unable to read the local file for upload.",
    );
  }

  const blob = await response.blob();

  return uploadFile(path, blob, contentType);
}
