import BouquetSvg, { AccessorySvg } from "./BouquetSvg";
import { bouquetView, ON_BOUQUET } from "@/lib/bouquet";

type Row = Parameters<typeof bouquetView>[0];

/* Where the "beside the bouquet" accessories sit when drawn on top of the bouquet's empty margins (small cards). */
const SLOTS: React.CSSProperties[] = [
  { left: "-12%", bottom: "0%", height: "38%" },
  { right: "-12%", bottom: "0%", height: "38%" },
  { left: "-16%", bottom: "40%", height: "34%" },
  { right: "-16%", bottom: "40%", height: "34%" },
  { left: "-4%", bottom: "0%", height: "28%" },
  { right: "-4%", bottom: "0%", height: "28%" },
];

/* Phone-only positions for the "beside" layout (written out in full so Tailwind keeps them). */
const BESIDE_MOBILE = [
  "max-md:left-[-6%] max-md:bottom-0 max-md:h-[36%]",
  "max-md:right-[-6%] max-md:bottom-0 max-md:h-[36%]",
  "max-md:left-[-8%] max-md:bottom-[38%] max-md:h-[30%]",
  "max-md:right-[-8%] max-md:bottom-[38%] max-md:h-[30%]",
  "max-md:left-[6%] max-md:bottom-0 max-md:h-[26%]",
  "max-md:right-[6%] max-md:bottom-0 max-md:h-[26%]",
];

/**
 * One saved bouquet with ALL of its design: flowers in their own color, wrap, ribbon, tag,
 * on-flower accessories (butterflies / fillers) and side accessories (teddy, balloon, ...).
 *
 *  layout="overlay" (default): side accessories tuck in next to the bouquet, so the card never gets wider.
 *                              Parent must give this a height (it fills 100% of it).
 *  layout="beside":            side accessories stand next to the bouquet (used on the big bouquet page).
 */
export default function BouquetDisplay({
  bouquet,
  layout = "overlay",
  animate = false,
  size = 300,
}: {
  bouquet: Row;
  layout?: "overlay" | "beside";
  animate?: boolean;
  size?: number;
}) {
  const v = bouquetView(bouquet);
  const side = v.accessories.filter((a) => !ON_BOUQUET.includes(a));

  const svg = (
    <BouquetSvg
      type={v.type}
      count={v.count}
      color={v.color}
      wrap={v.wrap}
      ribbon={v.ribbon}
      tag={v.tag}
      size={size}
      animate={animate}
      accessory={v.accessories}
    />
  );

  if (layout === "beside") {
    /* Phones: accessories tuck onto the bouquet's edges so nothing overflows the screen.
       md and up: they stand next to the bouquet. */
    return (
      <div className="relative mx-auto flex h-full w-fit max-w-full items-end justify-center md:gap-3">
        {side.map((a, i) => (
          <div
            key={a}
            className={`pointer-events-none flex items-end max-md:absolute max-md:z-10 md:h-[40%] md:shrink-0 [&>svg]:h-full [&>svg]:w-auto ${BESIDE_MOBILE[i % BESIDE_MOBILE.length]}`}
          >
            <AccessorySvg value={a} size={110} />
          </div>
        ))}
        <div className="h-full [&>svg]:h-full [&>svg]:w-auto">{svg}</div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-full w-fit [&>svg]:h-full [&>svg]:w-auto">
      {svg}
      {side.map((a, i) => (
        <div
          key={a}
          className="pointer-events-none absolute z-10 flex items-end [&>svg]:h-full [&>svg]:w-auto"
          style={SLOTS[i % SLOTS.length]}
        >
          <AccessorySvg value={a} size={60} />
        </div>
      ))}
    </div>
  );
}