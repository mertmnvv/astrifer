import { getPricingConfig } from "@/lib/pricingConfig";
import DigitalProductClient from "./DigitalProductClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const pricing = await getPricingConfig();
  return <DigitalProductClient pricing={pricing} />;
}
