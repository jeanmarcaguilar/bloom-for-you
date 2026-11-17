import BloomBackdrop from "@/components/BloomBackdrop";

export default function BouquetLoading() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden md:h-dvh">
      <BloomBackdrop variant="home" />

      {/* top bar skeleton */}
      <div className="absolute left-0 top-0 z-20 px-6 py-5 sm:px-10">
        <span className="inline-flex h-10 w-36 animate-pulse rounded-full bg-white/50" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col items-center justify-center gap-[3vh] px-4 py-16 text-center sm:px-6 md:py-6">
        {/* bouquet skeleton */}
        <div className="h-[clamp(200px,min(52vh,84vw),560px)] md:h-[clamp(260px,62vh,560px)] w-[clamp(160px,min(42vh,68vw),460px)] animate-pulse rounded-3xl bg-white/30 backdrop-blur-sm" />

        {/* button skeleton */}
        <div className="h-11 w-44 animate-pulse rounded-full bg-white/40" />
      </main>
    </div>
  );
}
