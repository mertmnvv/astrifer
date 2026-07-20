"use client";

import { NightPageShell } from "./NightPageShell";

export interface BlankPageProps {
  widthPx?: number;
  heightPx?: number;
}

/** Pages 11-25: 15 plain, unlined pages for the owner's own words — rendered/printed once and reused for all 15 slots. */
export function BlankPage({ widthPx, heightPx }: BlankPageProps) {
  return <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={true}>{null}</NightPageShell>;
}
