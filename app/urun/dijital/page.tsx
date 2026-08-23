import { getPricingConfig } from "@/lib/pricingConfig";
import { ArchiveHeader, ArchiveFooter } from "@/components/v2/ArchiveChrome";
import { DigitalProductV2 } from "@/components/v2/DigitalProductV2";

export const dynamic = "force-dynamic";

export default async function Page() {
  const pricing = await getPricingConfig();
  return <div className="archive-shell"><ArchiveHeader /><DigitalProductV2 pricing={pricing} /><ArchiveFooter /></div>;
}
