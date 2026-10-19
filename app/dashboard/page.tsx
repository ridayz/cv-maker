import { Suspense } from "react";
import { DashboardList } from "@/components/dashboard-list";

export default function Page() {
  return (
    <Suspense fallback={<div className="skeleton h-40" />}>
      <DashboardList />
    </Suspense>
  );
}
