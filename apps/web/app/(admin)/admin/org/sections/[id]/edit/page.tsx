"use client";

import { useParams } from "next/navigation";
import { MasterForm } from "@/components/admin/MasterForm";
import { MASTER_CONFIGS } from "@/lib/admin/master-config";

export default function EditSectionPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">{MASTER_CONFIGS.sections.title}編集</h1>
      <MasterForm config={MASTER_CONFIGS.sections} id={id} />
    </div>
  );
}
