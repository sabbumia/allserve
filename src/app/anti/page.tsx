// src/app/anti/page.tsx
import { getAntiRecords } from "./actions";
import { AntiForm } from "./AntiForm";

export const dynamic = "force-dynamic";

export default async function AntiPage() {
  const records = await getAntiRecords();
  return <AntiForm records={records} />;
}