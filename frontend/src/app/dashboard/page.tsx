import { redirect } from "next/navigation";

/**
 * Dashboard page that redirects to tasks.
 * This page exists to handle /dashboard URLs correctly.
 */
export default function DashboardPage() {
  redirect("/tasks");
}
