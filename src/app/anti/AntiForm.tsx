// src/app/anti/AntiForm.tsx
"use client";

import { useRef, useState, useTransition } from "react";
import { addAntiRecord, deleteAntiRecord, updateNote } from "./actions";
import type { AntiRecord } from "@/db/schema";

export function AntiForm({ records }: { records: AntiRecord[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await addAntiRecord({
        name: fd.get("name") as string,
        expireDate: fd.get("expireDate") as string,
        reactiveDate: fd.get("reactiveDate") as string,
        note: (fd.get("note") as string) || null,
      });
      formRef.current?.reset();
    });
  }

  function handleDelete(id: number) {
    startTransition(() => deleteAntiRecord(id));
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center gap-3 shadow-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <h1 className="text-base font-semibold text-gray-800 tracking-tight">
          Anti Records
        </h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* Add Form Card */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Add New Record</h2>
          <form ref={formRef} onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Name" name="name" type="text" placeholder="e.g. Alpha" />
              <Field label="Expire Date" name="expireDate" type="date" placeholder="" />
              <Field label="Reactive Date" name="reactiveDate" type="date" placeholder="" />
            </div>

            {/* Note — full width, optional */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Note{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="note"
                placeholder="Any additional notes…"
                rows={2}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Adding…" : "Add"}
              </button>
              <button
                type="reset"
                className="px-5 py-2 text-sm font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        {/* Records List */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-700">All Records</h2>
            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
              {records.length} total
            </span>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-14 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
              No records yet. Add one above.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {records.map((rec) => (
                <RecordRow
                  key={rec.id}
                  rec={rec}
                  isPending={isPending}
                  onDelete={() => handleDelete(rec.id)}
                  onSaveNote={(note) =>
                    startTransition(() => updateNote(rec.id, note))
                  }
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* ─── Individual record row with inline note editing ─── */
function RecordRow({
  rec,
  isPending,
  onDelete,
  onSaveNote,
}: {
  rec: AntiRecord;
  isPending: boolean;
  onDelete: () => void;
  onSaveNote: (note: string) => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(rec.note ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleEditClick() {
    setEditingNote(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleSave() {
    setEditingNote(false);
    onSaveNote(noteValue);
  }

  function handleCancel() {
    setNoteValue(rec.note ?? "");
    setEditingNote(false);
  }

  return (
    <div className="py-4 space-y-2">
      {/* Top row: name + dates + remove */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{rec.name}</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>
              <span className="text-gray-300 mr-1">Expires:</span>
              {rec.expireDate}
            </span>
            <span>
              <span className="text-gray-300 mr-1">Reactive:</span>
              {rec.reactiveDate}
            </span>
          </div>
        </div>

        <button
          onClick={onDelete}
          disabled={isPending}
          className="shrink-0 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Remove
        </button>
      </div>

      {/* Note row */}
      {editingNote ? (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            rows={2}
            placeholder="Write a note…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Save Note
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleEditClick}
          className="w-full text-left text-xs rounded-lg px-3 py-2 border border-dashed border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          {rec.note ? (
            <span className="text-gray-600">{rec.note}</span>
          ) : (
            <span>+ Add note…</span>
          )}
        </button>
      )}
    </div>
  );
}

/* ─── Reusable input field ─── */
function Field({
  label,
  name,
  type,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required
        className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
      />
    </div>
  );
}