/**
 * Storage service (stub).
 *
 * Future: upload avatar art and other media to Firebase Storage.
 */
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { storage } from "@/config/firebase";

export async function uploadFile(
  path: string,
  data: Blob | Uint8Array | ArrayBuffer,
  contentType?: string
) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, data, contentType ? { contentType } : undefined);
  return getDownloadURL(fileRef);
}
