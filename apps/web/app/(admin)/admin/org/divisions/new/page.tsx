"use client";

import { MasterForm } from "@/components/admin/MasterForm";
import { MASTER_CONFIGS } from "@/lib/admin/master-config";

export default function NewDivisionPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">{MASTER_CONFIGS.divisions.title}新規作成</h1>
      <MasterForm config={MASTER_CONFIGS.divisions} />
    </div>
  );
}
