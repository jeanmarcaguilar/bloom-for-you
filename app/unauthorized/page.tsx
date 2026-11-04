import Link from "next/link";
export default function Unauthorized() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-2xl text-rose">This part of the garden is private.</h1>
      <Link href="/home" className="mt-6 text-primary underline">Back home</Link>
    </main>
  );
}
