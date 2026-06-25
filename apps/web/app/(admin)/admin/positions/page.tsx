"use client";

import { MasterListView } from "@/components/admin/MasterListView";
import { MASTER_CONFIGS } from "@/lib/admin/master-config";

export default function PositionsListPage() {
  return <MasterListView config={MASTER_CONFIGS.positions} />;
}
