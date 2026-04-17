// src/app/anti/actions.ts
"use server";

import { db } from "@/db";
import { antiRecords, type NewAntiRecord } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAntiRecords() {
  return await db
    .select()
    .from(antiRecords)
    .orderBy(antiRecords.createdAt);
}

export async function addAntiRecord(data: Omit<NewAntiRecord, "id" | "createdAt">) {
  await db.insert(antiRecords).values(data);
  revalidatePath("/anti");
}

export async function deleteAntiRecord(id: number) {
  await db.delete(antiRecords).where(eq(antiRecords.id, id));
  revalidatePath("/anti");
}

export async function updateNote(id: number, note: string) {
  await db
    .update(antiRecords)
    .set({ note: note.trim() || null })
    .where(eq(antiRecords.id, id));
  revalidatePath("/anti");
}