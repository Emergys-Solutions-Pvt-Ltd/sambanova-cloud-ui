const DOTS = [1, 2, 3, 4, 5] as const;

function Comet({ className }: { className: string }) {
  return (
    <span className={className}>
      {DOTS.map((dot) => (
        <i key={dot} className="pg-loader__dot" />
      ))}
    </span>
  );
}

/**
 * Pending-reply loader (Figma: Loader17 `695:14001`, frame `1398:122277`): two amber
 * comets spinning clockwise. Decorative: the message list's status region announces
 * "Generating response", so the loader is hidden from assistive tech.
 */
export function ThinkingLoader() {
  return (
    <div
      aria-hidden="true"
      className="animate-[sn-fade-in_300ms_linear] motion-reduce:animate-none"
    >
      <span className="pg-loader">
        <span className="pg-loader__ring">
          <Comet className="pg-loader__comet pg-loader__comet--a" />
          <Comet className="pg-loader__comet" />
        </span>
      </span>
    </div>
  );
}
