"use client";

import { DashboardContent } from "./DashboardContent";
import type { LoanApplication } from "@/types/database";

interface DashboardProps {
  applications: LoanApplication[];
}

export function Dashboard({ applications }: DashboardProps) {
  return <DashboardContent applications={applications} />;
}
