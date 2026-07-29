/**
 * Firebase Storage service.
 *
 * Provides a shared helper for uploading files and returning
 * their public download URLs.
 */

import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/config/firebase";

export async function uploadFile(
  path: string,
  data: Blob | Uint8Array | ArrayBuffer,
  contentType?: string,
): Promise<string> {
  const fileRef = ref(storage, path);

  await uploadBytes(
    fileRef,
    data,
    contentType
      ? { contentType }
      : undefined,
  );

  return getDownloadURL(fileRef);
}