export interface LetterInsertPageProps {
  letterText: string;
  openingDateLabel: string;
  widthPx?: number;
  heightPx?: number;
}

/**
 * The sealed letter insert — a SEPARATE print target from the 26 book
 * pages, containing the owner's own private letter text. Deliberately
 * styled as its own physical card (cream paper, not the navy book theme)
 * since it's meant to be slipped into the back-cover pocket, not bound into
 * the book. Never reachable except through the same admin-gated,
 * short-lived signed URL pattern as the rest of the book's print files.
 */
export function LetterInsertPage({ letterText, openingDateLabel, widthPx, heightPx }: LetterInsertPageProps) {
  return (
    <div
      className="flex flex-col justify-between bg-[#fffdf6] px-[10%] py-[9%]"
      style={widthPx && heightPx ? { width: widthPx, height: heightPx } : undefined}
    >
      <p className="text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-[#a9832f]">
        Şu tarihte açılsın: {openingDateLabel}
      </p>
      <p className="whitespace-pre-line font-display text-[15px] italic leading-[1.7] text-[#33291a]">{letterText}</p>
      <div className="h-px w-full bg-[#e6b877]" />
    </div>
  );
}
