"use client";

import { MasterListView } from "@/components/admin/MasterListView";
import { MASTER_CONFIGS } from "@/lib/admin/master-config";

export default function SectionsListPage() {
  return <MasterListView config={MASTER_CONFIGS.sections} />;
}
