import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth/guards";

// The dashboard now lives on the owner's one-page /home.
export default async function AdminOverview() {
    await requireOwner();
    redirect("/home");
}