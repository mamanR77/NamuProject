import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function StaffIndex() {
  const user = await getCurrentUser();
  if (user?.role === ROLES.ADMIN) redirect("/admin");
  if (user?.role === ROLES.SECURITY) redirect("/security");
  redirect("/staff/login");
}
