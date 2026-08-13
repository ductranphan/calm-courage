/**
 * Firebase Storage helpers for child media uploads.
 */

import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
  type StorageReference,
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

async function deleteStorageFolder(
  folderRef: StorageReference,
): Promise<void> {
  const listing = await listAll(folderRef);

  await Promise.all(
    listing.items.map((item) => deleteObject(item)),
  );

  await Promise.all(
    listing.prefixes.map((prefix) =>
      deleteStorageFolder(prefix),
    ),
  );
}

/**
 * Deletes every Storage object under a child folder.
 * Failures are logged so Firestore deletion can continue.
 */
export async function deleteChildStorageFiles(
  parentUid: string,
  childId: string,
): Promise<void> {
  const folderRef = ref(
    storage,
    `parents/${parentUid}/children/${childId}`,
  );

  try {
    await deleteStorageFolder(folderRef);
  } catch (error) {
    console.warn(
      "Unable to delete child Storage files:",
      error,
    );
  }
}

/**
 * Deletes every Storage object under a parent folder.
 */
export async function deleteParentStorageFiles(
  parentUid: string,
): Promise<void> {
  const folderRef = ref(
    storage,
    `parents/${parentUid}`,
  );

  try {
    await deleteStorageFolder(folderRef);
  } catch (error) {
    console.warn(
      "Unable to delete parent Storage files:",
      error,
    );
  }
}
