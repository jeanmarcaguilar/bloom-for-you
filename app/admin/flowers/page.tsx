import { redirect } from "next/navigation";
// The single-flower form is now the bouquet creator.
export default function FlowersRedirect() { redirect("/admin/bouquets/new"); }