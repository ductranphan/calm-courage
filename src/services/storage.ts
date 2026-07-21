/**
 * Storage service (stub).
 *
 * Future: upload avatar art and check-in audio to Firebase Storage.
 * Suggested paths:
 *   parents/{parentUid}/children/{childId}/avatars/...
 *   parents/{parentUid}/children/{childId}/checkIns/{checkInId}.m4a
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
