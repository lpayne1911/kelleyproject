// The offer ladder from the business plan deck. Single source of truth for
// pricing shown on the site and seeded into the `packages` table.

export type PackageRole = "front_door" | "core" | "recurring" | "flagship" | "custom";
export type Engine = "auto" | "credit" | "both";

export interface OfferPackage {
  code: string;
  name: string;
  engine: Engine;
  role: PackageRole;
  blurb: string;
  price: string;
  priceNote?: string;
}

export const PACKAGES: OfferPackage[] = [
  {
    code: "deal_check",
    name: "Deal Check",
    engine: "auto",
    role: "front_door",
    blurb: "Fast audit of an existing dealer quote — red / yellow / green.",
    price: "$99–$199",
  },
  {
    code: "deal_rescue",
    name: "Deal Rescue",
    engine: "auto",
    role: "core",
    blurb: "Full line-by-line teardown, cut list, and negotiation scripting.",
    price: "$349–$999",
  },
  {
    code: "credit_program",
    name: "Credit Program",
    engine: "credit",
    role: "recurring",
    blurb: "Review, dispute, and rebuild — billed monthly for work performed.",
    price: "$149 setup",
    priceNote: "+ $99 / month",
  },
  {
    code: "credit_to_keys",
    name: "Credit-to-Keys",
    engine: "both",
    role: "flagship",
    blurb: "Credit prep, sourcing, review, and signing support — the whole journey.",
    price: "$1,799–$3,500",
  },
  {
    code: "fleet_family",
    name: "Fleet / Family",
    engine: "auto",
    role: "custom",
    blurb: "Multi-car household or employee benefit program.",
    price: "Custom",
  },
];
