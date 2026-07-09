interface Star {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

/** Deterministic PRNG so star positions match between server render and hydration. */
function seededRandom(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStars(count: number): Star[] {
  const random = seededRandom(1337);
  return Array.from({ length: count }, () => ({
    left: random() * 100,
    top: random() * 100,
    size: random() < 0.85 ? 1 : random() < 0.6 ? 1.5 : 2,
    delay: random() * 5,
    duration: 3 + random() * 4,
    opacity: 0.35 + random() * 0.5,
  }));
}

const STARS = buildStars(160);

/**
 * Ambient full-page starfield: fixed behind all content so the whole page
 * reads as open sky, not just the astronomical chart at the top. Purely
 * decorative — ignore for scroll math, hit-testing, screen readers.
 */
export function Starfield() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {STARS.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-text motion-reduce:animate-none animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
