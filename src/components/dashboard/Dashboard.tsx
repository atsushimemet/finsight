"use client";

import { DashboardContent } from "./DashboardContent";
import type { LoanApplication } from "@/types/database";

interface DashboardProps {
  applications: LoanApplication[];
  isLoggedIn: boolean;
}

export function Dashboard({ applications, isLoggedIn }: DashboardProps) {
  return <DashboardContent applications={applications} isLoggedIn={isLoggedIn} />;
}
