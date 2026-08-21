/**
 * Support ticket service for Contact Us submissions.
 */

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/config/firebase";

export type SupportTicketInput = {
  parentUid?: string | null;
  email: string;
  subject: string;
  message: string;
};

export async function createSupportTicket(
  input: SupportTicketInput,
): Promise<string> {
  const email = input.email.trim().toLowerCase();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!email || !subject || !message) {
    throw new Error(
      "Please fill in email, subject, and message.",
    );
  }

  const ref = await addDoc(
    collection(db, "supportTickets"),
    {
      parentUid: input.parentUid ?? null,
      email,
      subject,
      message,
      status: "open",
      createdAt: serverTimestamp(),
    },
  );

  return ref.id;
}
