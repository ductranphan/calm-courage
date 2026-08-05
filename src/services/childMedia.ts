/**
 * Child media metadata service.
 *
 * Audio and workbook artifacts upload to Firebase Storage, then a
 * Firestore metadata document is stored under:
 * parents/{parentUid}/children/{childId}/media/{mediaId}
 */

import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import {
  completeActivityById,
} from "@/services/activityAttempts";
import { uploadLocalFile } from "@/services/storage";

export type ChildMediaKind =
  | "recording_answer"
  | "workbook_audio"
  | "workbook_drawing";

export type ChildMediaRecord = {
  id: string;
  kind: ChildMediaKind;
  storagePath: string;
  downloadUrl: string;
  emotionId?: string;
  pageIndex?: number;
  pageId?: string;
  durationMs?: number;
  drawingPayload?: string;
  rewardedActivityId?: string;
  createdAt?: unknown;
};

export type SaveRecordingAnswerInput = {
  localUri: string;
  emotionId?: string;
  durationMs?: number;
  /**
   * When true (default), completes phase1_brave_breath once on first save.
   */
  awardBraveBreath?: boolean;
};

export type SaveWorkbookPageInput = {
  pageIndex: number;
  pageId: string;
  audioLocalUri?: string | null;
  drawingPayload?: string | null;
  /**
   * When true, completes phase1_proud_moment if every required page
   * already has a saved drawing or audio in Firestore.
   */
  tryCompleteProudMoment?: boolean;
  requiredPageCount?: number;
};

function mediaCollection(
  parentUid: string,
  childId: string,
) {
  return collection(
    db,
    "parents",
    parentUid,
    "children",
    childId,
    "media",
  );
}

function extensionFromUri(uri: string): string {
  const cleanUri = uri.split("?")[0];
  const match = cleanUri.match(/\.[a-zA-Z0-9]+$/);
  return match?.[0] ?? ".m4a";
}

/**
 * Uploads a voice answer, stores metadata, and awards Brave Breath once.
 */
export async function saveRecordingAnswer(
  parentUid: string,
  childId: string,
  input: SaveRecordingAnswerInput,
): Promise<ChildMediaRecord> {
  const extension = extensionFromUri(input.localUri);
  const mediaId = `recording_${Date.now()}`;
  const storagePath =
    `parents/${parentUid}/children/${childId}/recordings/${mediaId}${extension}`;

  const uploaded = await uploadLocalFile(
    storagePath,
    input.localUri,
    "audio/mp4",
  );

  const shouldAward = input.awardBraveBreath !== false;

  const docRef = await addDoc(
    mediaCollection(parentUid, childId),
    {
      kind: "recording_answer",
      storagePath: uploaded.path,
      downloadUrl: uploaded.downloadUrl,
      emotionId: input.emotionId ?? null,
      durationMs: input.durationMs ?? null,
      rewardedActivityId: shouldAward
        ? "phase1_brave_breath"
        : null,
      createdAt: serverTimestamp(),
    },
  );

  if (shouldAward) {
    await completeActivityById(
      parentUid,
      childId,
      "phase1_brave_breath",
      {
        source: "recording_answer",
        mediaId: docRef.id,
        emotionId: input.emotionId ?? null,
      },
    );
  }

  return {
    id: docRef.id,
    kind: "recording_answer",
    storagePath: uploaded.path,
    downloadUrl: uploaded.downloadUrl,
    emotionId: input.emotionId,
    durationMs: input.durationMs,
    rewardedActivityId: shouldAward
      ? "phase1_brave_breath"
      : undefined,
  };
}

/**
 * Saves workbook page audio and/or drawing metadata.
 * Optionally completes Proud Moment when enough pages are saved.
 */
export async function saveWorkbookPage(
  parentUid: string,
  childId: string,
  input: SaveWorkbookPageInput,
): Promise<ChildMediaRecord[]> {
  const saved: ChildMediaRecord[] = [];
  const stamp = Date.now();

  if (input.audioLocalUri) {
    const extension = extensionFromUri(
      input.audioLocalUri,
    );
    const storagePath =
      `parents/${parentUid}/children/${childId}/workbook/${input.pageIndex}/audio_${stamp}${extension}`;

    const uploaded = await uploadLocalFile(
      storagePath,
      input.audioLocalUri,
      "audio/mp4",
    );

    const docRef = await addDoc(
      mediaCollection(parentUid, childId),
      {
        kind: "workbook_audio",
        storagePath: uploaded.path,
        downloadUrl: uploaded.downloadUrl,
        pageIndex: input.pageIndex,
        pageId: input.pageId,
        createdAt: serverTimestamp(),
      },
    );

    saved.push({
      id: docRef.id,
      kind: "workbook_audio",
      storagePath: uploaded.path,
      downloadUrl: uploaded.downloadUrl,
      pageIndex: input.pageIndex,
      pageId: input.pageId,
    });
  }

  if (input.drawingPayload) {
    /*
     * Drawings stay in Firestore as path JSON. Uploading Blob payloads
     * from React Native is unreliable across Hermes builds.
     */
    const docRef = await addDoc(
      mediaCollection(parentUid, childId),
      {
        kind: "workbook_drawing",
        storagePath: "",
        downloadUrl: "",
        pageIndex: input.pageIndex,
        pageId: input.pageId,
        drawingPayload: input.drawingPayload,
        createdAt: serverTimestamp(),
      },
    );

    saved.push({
      id: docRef.id,
      kind: "workbook_drawing",
      storagePath: "",
      downloadUrl: "",
      pageIndex: input.pageIndex,
      pageId: input.pageId,
      drawingPayload: input.drawingPayload,
    });
  }

  if (input.tryCompleteProudMoment) {
    await maybeCompleteWorkbookProudMoment(
      parentUid,
      childId,
      input.requiredPageCount ?? 3,
    );
  }

  return saved;
}

/**
 * Completes phase1_proud_moment once the child has saved media for
 * enough distinct workbook pages.
 */
export async function maybeCompleteWorkbookProudMoment(
  parentUid: string,
  childId: string,
  requiredPageCount = 3,
): Promise<boolean> {
  const snapshot = await getDocs(
    mediaCollection(parentUid, childId),
  );

  const pages = new Set<number>();

  for (const mediaDoc of snapshot.docs) {
    const data = mediaDoc.data() as Record<
      string,
      unknown
    >;

    if (
      data.kind !== "workbook_audio" &&
      data.kind !== "workbook_drawing"
    ) {
      continue;
    }

    if (typeof data.pageIndex === "number") {
      pages.add(data.pageIndex);
    }
  }

  if (pages.size < requiredPageCount) {
    return false;
  }

  await completeActivityById(
    parentUid,
    childId,
    "phase1_proud_moment",
    {
      source: "digital_workbook",
      pagesSaved: pages.size,
    },
  );

  return true;
}

export async function listChildMedia(
  parentUid: string,
  childId: string,
): Promise<ChildMediaRecord[]> {
  const snapshot = await getDocs(
    query(
      mediaCollection(parentUid, childId),
      orderBy("createdAt", "desc"),
    ),
  );

  return snapshot.docs.map((mediaDoc) => {
    const data = mediaDoc.data() as Record<
      string,
      unknown
    >;

    return {
      id: mediaDoc.id,
      kind: data.kind as ChildMediaKind,
      storagePath: String(data.storagePath ?? ""),
      downloadUrl: String(data.downloadUrl ?? ""),
      emotionId:
        typeof data.emotionId === "string"
          ? data.emotionId
          : undefined,
      pageIndex:
        typeof data.pageIndex === "number"
          ? data.pageIndex
          : undefined,
      pageId:
        typeof data.pageId === "string"
          ? data.pageId
          : undefined,
      durationMs:
        typeof data.durationMs === "number"
          ? data.durationMs
          : undefined,
      drawingPayload:
        typeof data.drawingPayload === "string"
          ? data.drawingPayload
          : undefined,
      rewardedActivityId:
        typeof data.rewardedActivityId === "string"
          ? data.rewardedActivityId
          : undefined,
      createdAt: data.createdAt,
    };
  });
}
