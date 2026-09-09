/**
 * Summary figures as one ruled strip rather than a row of shadowed cards.
 * Cells carry their own hairlines and pull back a pixel, so the rules stay
 * exactly 1px at every breakpoint and a short final row simply grows to fill.
 * Each item is { label, value, tone? }.
 */
function FigureStrip({ items }) {
  return (
    <dl className="flex flex-wrap rounded-lg border border-line bg-ink-2 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.label}
          className="grow basis-1/2 sm:basis-1/3 lg:basis-1/5 min-w-0
                     px-4 py-4 sm:px-5 sm:py-5
                     border-l border-t border-line -ml-px -mt-px"
        >
          <dt className="text-mute text-[12.5px] leading-none truncate">
            {item.label}
          </dt>

          <dd
            className="figure wide text-[23px] sm:text-[27px] font-semibold mt-2.5 leading-none truncate"
            style={item.tone ? { color: item.tone } : undefined}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default FigureStrip;
