import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function StaffIndex() {
  const user = await getCurrentUser();
  if (user && user.role === ROLES.ADMIN) redirect("/admin");
  redirect("/staff/login");
}
