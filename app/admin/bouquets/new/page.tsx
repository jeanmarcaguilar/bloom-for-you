import { requireOwner } from "@/lib/auth/guards";
import BouquetForm from "../bouquet-form";

export const metadata = { title: "Create Bouquet · Bloom for You" };
export const dynamic = "force-dynamic";

export default async function CreateBouquetPage() {
  await requireOwner();
  return <BouquetForm />;
}