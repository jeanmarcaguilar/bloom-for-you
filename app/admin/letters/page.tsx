import { requireOwner } from "@/lib/auth/guards";
import LetterForm from "./letter-form";

export const metadata = { title: "Write Letter · Bloom for You" };

export default async function CreateLetterPage() {
  await requireOwner();
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <LetterForm />
    </main>
  );
}

