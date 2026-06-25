"use client";

import { MasterForm } from "@/components/admin/MasterForm";
import { MASTER_CONFIGS } from "@/lib/admin/master-config";

export default function NewDepartmentPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">{MASTER_CONFIGS.departments.title}新規作成</h1>
      <MasterForm config={MASTER_CONFIGS.departments} />
    </div>
  );
}
